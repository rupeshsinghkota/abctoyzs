import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, productName, customerName, customerEmail, customerPhone, productPrice } = body;

        console.log('[BookingPayment] Received Booking Request:', { customerName, customerPhone, productName });

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Missing Razorpay credentials');
            // Mock response for dev if needed, or throw error
            return NextResponse.json({ message: 'Merchant Setup Required (Razorpay)' }, { status: 500 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Create a "Booking" type Address record using Admin (Guest friendly)
        const { data: address, error: addrError } = await supabaseAdmin
            .from('addresses')
            .insert({
                user_id: null, // Don't link video call address to user profile to prevent clutter
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

        if (addrError || !address) {
            console.error('[BookingPayment] Address Error:', addrError);
            throw new Error(`Failed to create address: ${addrError?.message}`);
        }

        // 2. Create the "Pending" Order in DB using Admin
        // We use payment_method BOOKING as it's handled in the checkout logic too
        const { data: orderDB, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: user?.id || null,
                total_amount: productPrice || 0,
                payment_status: 'pending',
                status: 'processing',
                payment_method: 'BOOKING',
                guest_email: customerEmail,
                shipping_address_id: address.id,
                advance_amount: 0 // Free Video Call
            })
            .select()
            .single();

        if (orderError || !orderDB) {
            console.error('[BookingPayment] Order Error:', orderError);
            throw new Error(`Failed to create order tracking: ${orderError?.message}`);
        }

        // 3. Create Order Item
        await supabaseAdmin.from('order_items').insert({
            order_id: orderDB.id,
            product_id: productId,
            product_name: productName,
            quantity: 1,
            price: productPrice || 0
        });

        // 4. Return success for free booking (skip Razorpay)
        console.log('[BookingPayment] Free Booking Initialized:', orderDB.id);

        return NextResponse.json({
            orderId: null, // No Razorpay order needed for free booking
            supabaseOrderId: orderDB.id,
            amount: 0,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error('Error creating booking flow:', error);
        return NextResponse.json({
            message: 'Failed to initialize booking',
            details: error.message
        }, { status: 500 });
    }
}
