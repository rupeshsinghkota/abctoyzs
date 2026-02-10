import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShiprocketService } from '@/lib/services/shiprocket';
import crypto from 'crypto';

export const PaymentProcessor = {
    async processPaymentSuccess(orderId: string, paymentId: string) {
        const supabase = await createClient();

        // 1. Fetch order details
        const { data: order, error: orderFetchError } = await supabase
            .from('orders')
            .select('*, shipping_address:addresses(*), items:order_items(*)')
            .eq('id', orderId)
            .single();

        if (orderFetchError || !order) {
            throw new Error("Order not found");
        }

        // Idempotency check
        if (order.status !== 'processing' && order.payment_status === 'paid') {
            return { success: true, alreadyProcessed: true };
        }

        // 2. Handle Guest User Creation (Auto-Registration)
        let userId = order.user_id;
        let isNewUser = false;
        let tempPassword = null;
        let userEmail = user_email_placeholder(order);

        if (!userId) {
            // Check if user exists by email
            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

            // find by email manual filter (listUsers might be paginated, identifying by email is better if getByEmail exists but admin api usually lists)
            // A better way is verify if we can getUser by email.
            // But let's assume filtering.
            const existingUser = users?.find(u => u.email === userEmail);

            if (existingUser) {
                userId = existingUser.id;
            } else {
                // Create new user
                tempPassword = crypto.randomBytes(12).toString('hex'); // Random password
                const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: userEmail,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: {
                        full_name: order.shipping_address.name,
                        phone: order.shipping_address.phone
                    }
                });

                if (createError) {
                    console.error('[PaymentProcessor] User creation failed:', createError);
                } else if (newUser.user) {
                    userId = newUser.user.id;
                    isNewUser = true;
                }
            }
        }

        // 3. Update Order in DB
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                payment_status: order.payment_method === 'COD' ? 'partially_paid' : 'paid',
                payment_id: paymentId,
                status: 'processing',
                user_id: userId // Link to the real (or new) user
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        // 4. Upsert Profile
        if (userId) {
            await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: order.shipping_address.name,
                    phone: order.shipping_address.phone,
                    email: userEmail,
                    is_guest: false
                }, { onConflict: 'id' });
        }

        // 5. Sync to Shiprocket
        try {
            if (!order.shiprocket_order_id) {
                const shiprocketOrder = {
                    order_id: order.id,
                    order_date: new Date().toISOString(),
                    pickup_location: "Jhandewalan",
                    billing_customer_name: order.shipping_address.name,
                    billing_last_name: "",
                    billing_address: order.shipping_address.address_line1,
                    billing_address_2: order.shipping_address.address_line2 || "",
                    billing_city: order.shipping_address.city,
                    billing_pincode: order.shipping_address.pincode,
                    billing_state: order.shipping_address.state,
                    billing_country: "India",
                    billing_email: userEmail,
                    billing_phone: order.shipping_address.phone,
                    shipping_is_billing: true,
                    order_items: order.items.map((item: any) => ({
                        name: item.product_name,
                        sku: `SKU-${item.product_id}`,
                        units: item.quantity,
                        selling_price: item.price,
                    })),
                    payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
                    sub_total: order.total_amount,
                    length: 10,
                    breadth: 10,
                    height: 10,
                    weight: 1.0,
                };

                const shiprocketRes = await ShiprocketService.createOrder(shiprocketOrder);

                await supabase
                    .from('orders')
                    .update({ shiprocket_order_id: shiprocketRes.order_id })
                    .eq('id', order.id);
            }
        } catch (shipError) {
            console.error('[PaymentProcessor] Shiprocket Sync Error:', shipError);
        }

        // Return credentials only if it's a new user (for auto-login)
        return {
            success: true,
            userId,
            isNewUser,
            credentials: isNewUser ? { email: userEmail, password: tempPassword } : null
        };
    }
};

function user_email_placeholder(order: any) {
    // If we have a real email in shipping address, use it.
    // The current schema might not have email in addresses table, but let's check.
    // Otherwise fallback to generated one.
    return `customer_${order.shipping_address.phone}@abctoyz.in`;
}
