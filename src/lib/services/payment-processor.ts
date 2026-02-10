import { createClient } from '@/lib/supabase/server';
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
            console.error(`[PaymentProcessor] Order ${orderId} not found`);
            throw new Error("Order not found");
        }

        // Idempotency check: If already paid, skip (unless we want to force sync)
        if (order.status !== 'processing' && order.payment_status === 'paid') {
            console.log(`[PaymentProcessor] Order ${orderId} already processed.`);
            return { success: true, alreadyProcessed: true };
        }

        // 2. Update Order in DB
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                payment_status: order.payment_method === 'COD' ? 'partially_paid' : 'paid',
                payment_id: paymentId,
                status: 'processing'
            })
            .eq('id', orderId);

        if (updateError) {
            console.error(`[PaymentProcessor] Failed to update order ${orderId}:`, updateError);
            throw updateError;
        }

        // 3. Upsert Profile (Guest or Authenticated)
        try {
            const profileId = order.user_id || crypto.randomUUID();
            await supabase
                .from('profiles')
                .upsert({
                    id: profileId,
                    full_name: order.shipping_address.name,
                    phone: order.shipping_address.phone,
                    is_guest: !order.user_id,
                    email: order.user_id ? null : user_email_placeholder(order)
                }, { onConflict: 'id' });
        } catch (profileError) {
            console.error('[PaymentProcessor] Profile Upsert Error:', profileError);
            // Non-blocking
        }

        // 4. Sync to Shiprocket
        try {
            // Check if already synced
            if (order.shiprocket_order_id) {
                console.log(`[PaymentProcessor] Order ${orderId} already synced to Shiprocket.`);
                return { success: true };
            }

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
                billing_email: user_email_placeholder(order),
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

            // Store shiprocket order ID
            await supabase
                .from('orders')
                .update({ shiprocket_order_id: shiprocketRes.order_id })
                .eq('id', order.id);

            console.log(`[PaymentProcessor] Order ${orderId} synced to Shiprocket (ID: ${shiprocketRes.order_id})`);

        } catch (shipError) {
            console.error('[PaymentProcessor] Shiprocket Sync Error:', shipError);
            // Don't fail the whole request
        }

        return { success: true };
    }
};

function user_email_placeholder(order: any) {
    return `customer_${order.user_id?.split('-')[0] || 'guest'}@abctoyz.com`;
}
