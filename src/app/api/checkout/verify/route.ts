import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { ShiprocketService } from '@/lib/services/shiprocket';

export async function POST(req: Request) {
    try {
        const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            throw new Error('RAZORPAY_KEY_SECRET is not configured');
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Update Order in DB
        const supabase = await createClient();

        // Fetch order details for Shiprocket
        const { data: order, error: orderFetchError } = await supabase
            .from('orders')
            .select('*, shipping_address:addresses(*), items:order_items(*)')
            .eq('id', order_id)
            .single();

        if (orderFetchError || !order) throw new Error("Order not found");

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                payment_status: order.payment_method === 'COD' ? 'partially_paid' : 'paid',
                payment_id: razorpay_payment_id,
                status: 'processing'
            })
            .eq('id', order_id);

        if (updateError) throw updateError;

        // 2.5 Upsert Profile (Guest or Authenticated)
        try {
            const profileId = order.user_id || crypto.randomUUID();
            await supabase
                .from('profiles')
                .upsert({
                    id: profileId,
                    full_name: order.shipping_address.name,
                    phone: order.shipping_address.phone,
                    is_guest: !order.user_id,
                    email: order.user_id ? null : user_email_placeholder(order) // Optional: Store placeholder for guests
                }, { onConflict: 'id' });

            // If it was a guest, we could optionally link the order to this new profile ID
            // but the profiles table 'id' for guests is currently just a record.
            // For now, the orders table links to user_id (auth.users). 
        } catch (profileError) {
            console.error('[Profile Upsert Error]:', profileError);
            // Non-blocking
        }

        // 3. Sync to Shiprocket
        try {
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
                billing_email: user_email_placeholder(order), // Helper or placeholder
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
                length: 10, // Default dimensions, should be from product metadata ideally
                breadth: 10,
                height: 10,
                weight: 1.0,
            };

            const shiprocketRes = await ShiprocketService.createOrder(shiprocketOrder);

            // Optionally store shiprocket order ID
            await supabase
                .from('orders')
                .update({ shiprocket_order_id: shiprocketRes.order_id })
                .eq('id', order.id);

        } catch (shipError) {
            console.error('[Shiprocket Sync Error]:', shipError);
            // Don't fail the whole request if Shiprocket sync fails, but log it
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Razorpay Verify Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function user_email_placeholder(order: any) {
    // Shiprocket requires email. If we don't have it, use a placeholder
    return `customer_${order.user_id?.split('-')[0] || 'guest'}@abctoyz.com`;
}
