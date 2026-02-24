// import { createClient } from '@/lib/supabase/server'; // Unused now
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShiprocketService } from '@/lib/services/shiprocket';
import crypto from 'crypto';
import { FacebookCapi } from '@/lib/services/facebook-capi';

export const PaymentProcessor = {
    async processPaymentSuccess(orderId: string, paymentId: string) {
        // 1. Fetch order details using Admin Client (Bypass RLS)
        // 1. Fetch order details using Admin Client (Bypass RLS)
        // We fetch separately to avoid issues with Supabase relationship definitions
        const { data: orderBase, error: orderFetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderFetchError || !orderBase) {
            console.error('[PaymentProcessor] Order Fetch Error:', orderFetchError);
            throw new Error(`Order not found: ${orderFetchError?.message || 'Unknown error'}`);
        }

        // Fetch related data manually
        const { data: shippingAddress } = await supabaseAdmin
            .from('addresses')
            .select('*')
            .eq('id', orderBase.shipping_address_id)
            .single();

        const { data: items } = await supabaseAdmin
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        // Combine into a single object for the rest of the logic
        const order = {
            ...orderBase,
            shipping_address: shippingAddress || {}, // Fallback if address missing
            items: items || []
        };

        // Idempotency check
        if (order.status !== 'processing' && order.payment_status === 'paid') {
            return { success: true, alreadyProcessed: true };
        }

        // 2. Handle Guest User Creation (Auto-Registration)
        let userId = order.user_id;
        let isNewUser = false;
        let tempPassword = null;
        let userEmail = order.guest_email || user_email_placeholder(order);

        if (!userId) {
            // Check if user exists by email
            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

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

        // 3. Update Order in DB using Admin Client
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                payment_status: order.payment_method === 'COD' ? 'partially_paid' : 'paid',
                payment_id: paymentId,
                status: 'processing',
                user_id: userId // Link to the real (or new) user
            })
            .eq('id', orderId);

        if (updateError) {
            console.error('[PaymentProcessor] Order Update Error:', updateError);
            throw updateError;
        }

        // 3b. Increment Coupon Usage
        if (order.coupon_code) {
            try {
                const { error: couponError } = await supabaseAdmin.rpc('increment_coupon_usage', {
                    coupon_code: order.coupon_code
                });

                if (couponError) {
                    // Fallback to manual increment if RPC missing
                    console.log('[PaymentProcessor] RPC increment_coupon_usage failed, trying manual update');
                    const { data: coupon } = await supabaseAdmin
                        .from('coupons')
                        .select('used_count')
                        .eq('code', order.coupon_code.toUpperCase())
                        .single();

                    if (coupon) {
                        await supabaseAdmin
                            .from('coupons')
                            .update({ used_count: (coupon.used_count || 0) + 1 })
                            .eq('code', order.coupon_code.toUpperCase());
                    }
                }
            } catch (err) {
                console.error('[PaymentProcessor] Failed to increment coupon usage:', err);
            }
        }

        // 4. Upsert Profile
        if (userId) {
            try {
                await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: userId,
                        full_name: order.shipping_address.name,
                        phone: order.shipping_address.phone,
                        email: userEmail,
                        is_guest: false
                    }, { onConflict: 'id' });
            } catch (profileError: any) {
                console.error('[PaymentProcessor] Profile update failed (likely missing email column), retrying without email:', profileError.message);
                // Fallback: Try without email
                await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: userId,
                        full_name: order.shipping_address.name,
                        phone: order.shipping_address.phone,
                        is_guest: false
                    }, { onConflict: 'id' });
            }
        }

        // 5. Sync to Shiprocket - Auto-create order after payment success
        try {
            if (!order.shiprocket_order_id) {
                const shiprocketOrder = {
                    order_id: order.id,
                    order_date: new Date().toISOString(),
                    pickup_location: "Jhandewalan", // Postcode: 110055
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
                    // If COD, the collectible amount is Total - Advance
                    sub_total: order.payment_method === 'COD' ? (order.total_amount - (order.advance_amount || 0)) : order.total_amount,
                    length: 100,   // Realistic toy dimensions (cm)
                    breadth: 60,
                    height: 50,
                    weight: 10.0,  // kg
                };

                console.log('[PaymentProcessor] Creating Shiprocket order:', shiprocketOrder);
                const shiprocketRes = await ShiprocketService.createOrder(shiprocketOrder);
                console.log('[PaymentProcessor] Shiprocket response:', shiprocketRes);

                // Extract shipment_id from response
                const shipmentId = shiprocketRes.shipments?.[0]?.id || shiprocketRes.shipment_id || null;

                await supabaseAdmin
                    .from('orders')
                    .update({
                        shiprocket_order_id: shiprocketRes.order_id,
                        shipment_id: shipmentId,
                        shipping_carrier: 'Shiprocket'
                    })
                    .eq('id', order.id);

                console.log('[PaymentProcessor] Order synced to Shiprocket successfully');
            }
        } catch (shipError) {
            console.error('[PaymentProcessor] Shiprocket Sync Error:', shipError);
            // Don't fail payment if Shiprocket sync fails
        }

        // 6. Send Purchase Event to Facebook Conversions API (CAPI)
        try {
            // Reconstruct full name parts
            const fullName = order.shipping_address.name || '';
            const [firstName, ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ');

            console.log('[PaymentProcessor] Preparing CAPI Event. Email:', userEmail, 'Phone:', order.shipping_address.phone, 'Name:', fullName);

            await FacebookCapi.trackEvent({
                eventName: 'Purchase',
                eventId: order.id, // Deduplication ID (Matches internal Order ID)
                eventTime: Math.floor(Date.now() / 1000),
                actionSource: 'website',
                eventSourceUrl: `https://abctoyz.in/checkout/success?orderId=${order.id}`,
                userData: {
                    email: userEmail,
                    phone: order.shipping_address.phone,
                    first_name: firstName,
                    last_name: lastName,
                    city: order.shipping_address.city,
                    state: order.shipping_address.state,
                    zip: order.shipping_address.pincode,
                    country: 'in', // Normalized to lowercase ISO 2-letter
                },
                customData: {
                    currency: 'INR',
                    value: order.total_amount,
                    order_id: order.id,
                    content_type: 'product',
                    contents: order.items.map((item: any) => ({
                        id: String(item.product_id), // Must match Catalog ID
                        quantity: item.quantity
                    }))
                }
            });
        } catch (capiError) {
            console.error('[PaymentProcessor] CAPI Error:', capiError);
            // Don't fail the whole payment process just because CAPI failed
        }

        // 7. Send WhatsApp Order Received Notification (Media Template)
        try {
            if (order.shipping_address.phone) {
                const { WhatsAppService } = await import('@/lib/services/whatsapp');
                const templateId = process.env.MSG91_ORDER_RECEIVED_TEMPLATE_ID || 'order_received';

                // Fetch first item's image for the media template
                let imageUrl = 'https://abctoyz.in/logo.png'; // Fallback
                if (order.items.length > 0) {
                    const { data: product } = await supabaseAdmin
                        .from('products')
                        .select('image')
                        .eq('id', order.items[0].product_id)
                        .single();

                    if (product?.image) {
                        imageUrl = product.image;
                    }
                }

                // Calculate refined amount display for WhatsApp variable {{3}}
                // Template is fixed as "Amount Paid: ₹{{3}}"
                let amountDisplay = String(order.total_amount);
                if (order.payment_method === 'COD' && order.advance_amount > 0) {
                    const balance = order.total_amount - order.advance_amount;
                    amountDisplay = `${order.advance_amount} (Balance ₹${balance} COD)`;
                }

                await WhatsAppService.sendMediaTemplateMessage(
                    order.shipping_address.phone,
                    templateId,
                    imageUrl,
                    {
                        "1": order.shipping_address.name || "Customer",
                        "2": order.id,
                        "3": amountDisplay
                    }
                );
                console.log('[PaymentProcessor] WhatsApp Order Received notification sent to:', order.shipping_address.phone);
            }
        } catch (waError) {
            console.error('[PaymentProcessor] WhatsApp Notification Error:', waError);
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
