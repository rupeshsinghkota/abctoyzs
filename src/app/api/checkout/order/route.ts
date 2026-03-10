import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { items, total_amount, discount_amount, coupon_code, shipping_address_id, payment_method, guest_email } = await req.json();

        console.log('[CreateOrder] Received payload:', { itemsCount: items?.length, total_amount, shipping_address_id, payment_method, guest_email });

        if (!items || !total_amount || !shipping_address_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Determine actual amount to be paid via Razorpay
        let razorpayAmount = total_amount;

        if (payment_method === 'COD') {
            const { data: settings } = await supabase.from('settings').select('*').single();
            if (settings?.cod_mode === 'partial') {
                if (settings.cod_advance_type === 'percentage') {
                    razorpayAmount = Math.round((total_amount * settings.cod_advance_value) / 100);
                } else {
                    razorpayAmount = settings.cod_advance_value;
                }
            } else {
                // Normal COD - no online payment required
                razorpayAmount = 0;
            }
        } else if (payment_method === 'BOOKING') {
            // Bookings always charge a flat ₹99 fee
            razorpayAmount = 99;
        }

        // 1. Create a "pending" order in database
        let order;
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    total_amount: total_amount,
                    discount_amount: discount_amount || 0,
                    coupon_code: coupon_code || null,
                    shipping_address_id: shipping_address_id,
                    payment_status: 'pending',
                    status: 'processing',
                    payment_method: payment_method || 'PREPAID',
                    guest_email: guest_email,
                    advance_amount: (payment_method === 'COD' || payment_method === 'BOOKING') ? razorpayAmount : 0
                })
                .select()
                .single();

            if (error) throw error;
            order = data;
        } catch (err: any) {
            console.error('[CreateOrder] First attempt failed (likely missing guest_email column):', err.message);
            // Fallback: Try without guest_email
            const { data, error } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    total_amount: total_amount,
                    shipping_address_id: shipping_address_id,
                    payment_status: 'pending',
                    status: 'processing',
                    payment_method: payment_method || 'PREPAID',
                    advance_amount: (payment_method === 'COD' || payment_method === 'BOOKING') ? razorpayAmount : 0
                })
                .select()
                .single();

            if (error) throw error;
            order = data;
        }

        // 2. Create Order Items
        const itemsToInsert = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_image: item.image,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // 3. Create Razorpay Order (Only if amount > 0)
        let razorpayOrderId = null;
        let razorpayAmountPaise = 0;
        let razorpayCurrency = 'INR';

        if (razorpayAmount > 0) {
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(razorpayAmount * 100), // Amount in paise
                currency: 'INR',
                receipt: order.id,
            });
            razorpayOrderId = razorpayOrder.id;
            razorpayAmountPaise = Number(razorpayOrder.amount);
            razorpayCurrency = razorpayOrder.currency;

            // 4. Update order with Razorpay Order ID
            await supabase
                .from('orders')
                .update({ razorpay_order_id: razorpayOrderId })
                .eq('id', order.id);
        } else if (payment_method === 'COD' && razorpayAmount === 0) {
            // FULL COD: No payment needed now. Create Shiprocket Order immediately.
            try {
                const { ShiprocketService } = await import('@/lib/services/shiprocket'); // Dynamic import

                // Need to fetch address details since we only have ID
                const { data: address } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('id', shipping_address_id)
                    .single();

                if (address) {
                    const shiprocketPayload = {
                        order_id: order.id,
                        order_date: new Date().toISOString(),
                        pickup_location: "Jhandewalan",
                        billing_customer_name: address.name,
                        billing_last_name: "",
                        billing_address: address.address_line1,
                        billing_address_2: address.address_line2 || "",
                        billing_city: address.city,
                        billing_pincode: address.pincode,
                        billing_state: address.state,
                        billing_country: "India",
                        billing_email: guest_email || "guest@abctoyz.in",
                        billing_phone: address.phone,
                        shipping_is_billing: true,
                        order_items: items.map((item: any) => ({
                            name: item.name,
                            sku: `SKU-${item.id}`,
                            units: item.quantity,
                            selling_price: item.price,
                        })),
                        payment_method: 'COD',
                        sub_total: total_amount, // For Full COD, collect everything
                        length: 100,
                        breadth: 60,
                        height: 50,
                        weight: 10.0
                    };

                    console.log('[CreateOrder] Creating Full COD Shiprocket Order...');
                    const shiprocketRes = await ShiprocketService.createOrder(shiprocketPayload);

                    const shipmentId = shiprocketRes.shipments?.[0]?.id || shiprocketRes.shipment_id || null;

                    await supabase
                        .from('orders')
                        .update({
                            shiprocket_order_id: shiprocketRes.order_id,
                            shipment_id: shipmentId,
                            shipping_carrier: 'Shiprocket'
                        })
                        .eq('id', order.id);

                    console.log('[CreateOrder] Full COD Shiprocket Order Created:', shiprocketRes.order_id);

                    // 4. Send Purchase Event to Facebook Conversions API (CAPI) for Full COD
                    try {
                        const { FacebookCapi } = await import('@/lib/services/facebook-capi');
                        const fullName = address.name || '';
                        const [firstName, ...lastNameParts] = fullName.split(' ');
                        const lastName = lastNameParts.join(' ');

                        await FacebookCapi.trackEvent({
                            eventName: 'Purchase',
                            eventId: order.id,
                            eventTime: Math.floor(Date.now() / 1000),
                            actionSource: 'website',
                            eventSourceUrl: `https://abctoyz.in/checkout/success?oid=${order.id}`,
                            userData: {
                                email: guest_email || `customer_${address.phone}@abctoyz.in`,
                                phone: address.phone,
                                first_name: firstName,
                                last_name: lastName,
                                city: address.city,
                                state: address.state,
                                zip: address.pincode,
                                country: 'in',
                            },
                            customData: {
                                currency: 'INR',
                                value: total_amount,
                                order_id: order.id,
                                content_type: 'product',
                                contents: items.map((item: any) => ({
                                    id: String(item.id),
                                    quantity: item.quantity
                                }))
                            }
                        });
                        console.log('[CreateOrder] Full COD CAPI Purchase event sent');
                    } catch (capiError) {
                        console.error('[CreateOrder] CAPI Error:', capiError);
                    }
                    // 5. Send WhatsApp Notification for Full COD
                    try {
                        const { WhatsAppService } = await import('@/lib/services/whatsapp');
                        const templateId = process.env.MSG91_ORDER_RECEIVED_TEMPLATE_ID || 'order_received';

                        // Fetch first item's image
                        let imageUrl = 'https://abctoyz.in/logo.png';
                        if (items.length > 0) {
                            const { data: p } = await supabase.from('products').select('image').eq('id', items[0].id).single();
                            if (p?.image) {
                                imageUrl = p.image.startsWith('http')
                                    ? p.image
                                    : `https://abctoyz.in${p.image.startsWith('/') ? '' : '/'}${p.image}`;
                            }
                        }

                        await WhatsAppService.sendMediaTemplateMessage(
                            address.phone,
                            templateId,
                            imageUrl,
                            {
                                "1": address.name || "Customer",
                                "2": order.id,
                                "3": `0 (Pay ₹${total_amount} at Delivery)`
                            }
                        );
                        console.log('[CreateOrder] Full COD WhatsApp notification sent');
                    } catch (waError) {
                        console.error('[CreateOrder] WhatsApp Error:', waError);
                    }

                    // 6. Mark Lead as Converted
                    try {
                        const leadPhone = address.phone.replace(/\D/g, "").slice(-10);
                        const { supabaseAdmin } = await import('@/lib/supabase/admin');
                        await supabaseAdmin
                            .from('leads')
                            .update({ status: 'converted', updated_at: new Date().toISOString() })
                            .eq('phone', leadPhone);
                        console.log(`[CreateOrder] Lead ${leadPhone} marked as converted (Full COD)`);
                    } catch (leadError) {
                        console.error('[CreateOrder] Lead conversion error:', leadError);
                    }
                }
            } catch (srError) {
                console.error('[CreateOrder] Shiprocket Error:', srError);
                // We do NOT block order creation if Shiprocket fails, but we log it.
            }
        }

        return NextResponse.json({
            order_id: order.id,
            razorpay_order_id: razorpayOrderId,
            amount: razorpayAmountPaise,
            total_amount: total_amount, // Full value for tracking
            currency: razorpayCurrency,
            prepayment: (payment_method === 'COD' || payment_method === 'BOOKING') && razorpayAmount > 0
        });

    } catch (error: any) {
        console.error('[Razorpay Order Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
