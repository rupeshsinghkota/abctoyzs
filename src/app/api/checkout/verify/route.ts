import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

        // 1. Verify Signature
        // NOTE: In production, use your RAZORPAY_KEY_SECRET from env
        const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET';
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
        const { error } = await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                payment_id: razorpay_payment_id,
                status: 'processing'
            })
            .eq('id', order_id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Razorpay Verify Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
