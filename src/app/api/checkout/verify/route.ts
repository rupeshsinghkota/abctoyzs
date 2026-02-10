import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentProcessor } from '@/lib/services/payment-processor';

export async function POST(req: Request) {
    try {
        const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error('RAZORPAY_KEY_SECRET is not configured');
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.error('[Razorpay Verify] Signature Mismatch');
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Process Successful Payment (Idempotent)
        const result = await PaymentProcessor.processPaymentSuccess(order_id, razorpay_payment_id);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Razorpay Verify Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
