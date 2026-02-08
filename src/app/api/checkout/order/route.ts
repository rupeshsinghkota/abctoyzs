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

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { items, total_amount, shipping_address_id } = await req.json();

        if (!items || !total_amount || !shipping_address_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create a "pending" order in database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: total_amount,
                shipping_address_id: shipping_address_id,
                payment_status: 'pending',
                status: 'processing' // Or 'pending' depending on your flow
            })
            .select()
            .single();

        if (orderError) throw orderError;

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
            amount: Math.round(total_amount * 100), // Amount in paise
            currency: 'INR',
            receipt: order.id,
        });

        // 4. Update order with Razorpay Order ID (optional but good for tracking)
        await supabase
            .from('orders')
            .update({ razorpay_order_id: razorpayOrder.id })
            .eq('id', order.id);

        return NextResponse.json({
            order_id: order.id,
            razorpay_order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });

    } catch (error: any) {
        console.error('[Razorpay Order Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
