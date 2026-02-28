import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, productName } = body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Missing Razorpay credentials');
            // Mock response if keys are missing (helpful for testing UI before setup)
            return NextResponse.json({
                orderId: `mock_order_${Date.now()}`,
                amount: 9900,
                key: 'mock_key'
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amountInPaise = 99 * 100; // ₹99 fee

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_booking_${Date.now()}`,
            notes: {
                payment_type: 'video_consultation_booking',
                productId: productId || 'unknown',
                productName: productName || 'unknown',
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error('Error creating Razorpay booking order:', error);
        return NextResponse.json({ message: 'Failed to create payment order' }, { status: 500 });
    }
}
