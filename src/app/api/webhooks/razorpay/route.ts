import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentProcessor } from '@/lib/services/payment-processor';

// Receive Webhook from Razorpay
export async function POST(req: Request) {
    try {
        const rawBody = await req.text(); // Need raw body for signature verification
        const signature = req.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // 1. Validate Secret & Signature
        if (!secret) {
            console.warn('[Webhook] RAZORPAY_WEBHOOK_SECRET is not set. Skipping verification (unsafe for prod).');
            // If checking fails, you might want to return 500 or just log it.
        } else if (signature) {
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(rawBody)
                .digest('hex');

            if (expectedSignature !== signature) {
                console.error('[Webhook] Invalid Signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        }

        const event = JSON.parse(rawBody);

        // 2. Handle 'order.paid'
        if (event.event === 'order.paid') {
            const payment = event.payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const razorpayPaymentId = payment.id;

            // The 'receipt' field in the order creation usually stores our DB Order ID.
            // But confirming via razorpay_order_id is safest if we can look it up.
            // However, our PaymentProcessor logic currently expects our DB Order ID.
            // Let's rely on the notes or metadata if available, OR query by razorpay_order_id.

            // NOTE: Since our DB stores razorpay_order_id, we need to find the order by that.
            // The PaymentProcessor expects our internal ID. Let's add a helper to it or find it here.

            const supabase = await import('@/lib/supabase/server').then(mod => mod.createClient());
            const { data: order, error } = await supabase
                .from('orders')
                .select('id')
                .eq('razorpay_order_id', razorpayOrderId)
                .single();

            if (error || !order) {
                console.error(`[Webhook] Order not found for Razorpay Order ID: ${razorpayOrderId}`);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            console.log(`[Webhook] Processing payment for Order: ${order.id}`);
            await PaymentProcessor.processPaymentSuccess(order.id, razorpayPaymentId);
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error: any) {
        console.error('[Webhook Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
