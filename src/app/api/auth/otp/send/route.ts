import { NextResponse } from 'next/server';
import { OTPService } from '@/lib/services/otp';

export async function POST(request: Request) {
    try {
        const { phone, cart_summary } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // --- Lead Capture ---
        try {
            const { supabaseAdmin } = await import('@/lib/supabase/admin');
            const cleanPhone = phone.replace(/\D/g, "");
            const leadPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

            if (leadPhone.length === 10) {
                await supabaseAdmin
                    .from('leads')
                    .upsert({
                        phone: leadPhone,
                        source: 'checkout_otp_requested',
                        cart_summary: cart_summary || null,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'phone',
                        ignoreDuplicates: false
                    });
            }
        } catch (leadError) {
            console.error('[OTP SEND] Lead capture failed:', leadError);
        }

        await OTPService.sendOTP(phone);

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully'
        });

    } catch (error: any) {
        console.error('[OTP SEND] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
