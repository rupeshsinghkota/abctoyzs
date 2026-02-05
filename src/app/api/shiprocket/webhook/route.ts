import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Admin context if needed, or use service role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Note: For real backend writes, you might want the SERVICE_ROLE_KEY if you have RLS policies.
// For now, using anon key.

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const bodyText = await request.text(); // Get raw body for HMAC check
        const signature = request.headers.get('x-api-hmac-sha256');
        const apiSecret = process.env.SHIPROCKET_API_SECRET || '';

        // 1. Verify HMAC Signature
        if (!apiSecret) {
            console.error("Missing SHIPROCKET_API_SECRET");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        const generatedSignature = crypto
            .createHmac('sha256', apiSecret)
            .update(bodyText)
            .digest('base64');

        if (signature !== generatedSignature) {
            console.error("Invalid Webhook Signature", { received: signature, generated: generatedSignature });
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = JSON.parse(bodyText);
        console.log("Received Shiprocket Webhook:", event);

        // 2. Handle Order Events
        // The structure depends on the specific event type (order.created, shipment.status_changed, etc.)
        // For Fast Checkout 'Order Success', we expect details about the placed order.

        if (event.razorpay_order_id || event.order_id) {
            // Example: Insert into your 'orders' table
            /*
            const { error } = await supabase.from('orders').insert({
                shiprocket_order_id: event.order_id,
                total_amount: event.total,
                status: 'paid', // Assuming success event
                payload: event
            });
            */
            console.log("Order processed successfully");
        }

        return NextResponse.json({ status: "success" });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
