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
        // If COD, prepayment is 500, otherwise full amount
        const razorpayAmount = payment_method === 'COD' ? 500 : total_amount;

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
                    guest_email: guest_email
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
                    payment_method: payment_method || 'PREPAID'
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

        // 3. Create Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(razorpayAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: order.id,
        });

        // 4. Update order with Razorpay Order ID
        await supabase
            .from('orders')
            .update({ razorpay_order_id: razorpayOrder.id })
            .eq('id', order.id);

        return NextResponse.json({
            order_id: order.id,
            razorpay_order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            prepayment: payment_method === 'COD'
        });

    } catch (error: any) {
        console.error('[Razorpay Order Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
