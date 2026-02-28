import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, productName, customerName, customerEmail, customerPhone, productPrice } = body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Missing Razorpay credentials');
            return NextResponse.json({
                orderId: `mock_order_${Date.now()}`,
                amount: 9900,
                key: 'mock_key'
            });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Create a "Booking" type Address record
        const { data: address, error: addrError } = await supabase
            .from('addresses')
            .insert({
                user_id: user?.id || null,
                name: customerName || 'Lead',
                phone: customerPhone || '',
                email: customerEmail || '',
                address_line1: 'Live Video Call Request',
                city: 'Online',
                state: 'Booking',
                pincode: '000000',
            })
            .select()
            .single();

        if (addrError) throw addrError;

        // 2. Create the "Pending" Order in DB
        const { data: orderDB, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user?.id || null,
                total_amount: productPrice || 0,
                payment_status: 'pending',
                status: 'processing',
                payment_method: 'BOOKING',
                guest_email: customerEmail,
                shipping_address_id: address.id,
                advance_amount: 99
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 3. Create Order Item
        await supabase.from('order_items').insert({
            order_id: orderDB.id,
            product_id: productId,
            product_name: productName,
            quantity: 1,
            price: productPrice || 0
        });

        // 4. Create Razorpay Order
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amountInPaise = 99 * 100; // ₹99 fee

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: orderDB.id,
            notes: {
                payment_type: 'video_consultation_booking',
                productId: productId || 'unknown',
                productName: productName || 'unknown',
                supabase_order_id: orderDB.id
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 5. Update Supabase Order with Razorpay Order ID
        await supabase
            .from('orders')
            .update({ razorpay_order_id: razorpayOrder.id })
            .eq('id', orderDB.id);

        return NextResponse.json({
            orderId: razorpayOrder.id,
            supabaseOrderId: orderDB.id,
            amount: razorpayOrder.amount,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error('Error creating booking flow:', error);
        return NextResponse.json({ message: 'Failed to initialize booking' }, { status: 500 });
    }
}
