import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { WhatsAppService } from '@/lib/services/whatsapp';

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // 1. Clean phone number (remove +, spaces, etc. but keep leading 91 if it's there)
        const cleanPhone = phone.replace(/\D/g, '');

        // 2. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        // 3. Save to database (otp_verifications table)
        const { error: dbError } = await supabaseAdmin
            .from('otp_verifications')
            .upsert({
                phone: cleanPhone,
                otp_code: otpCode,
                expires_at: expiresAt.toISOString(),
                verified: false,
                attempts: 0
            }, { onConflict: 'phone' });

        if (dbError) {
            console.error('[OTP SEND] Database error:', dbError);
            return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
        }

        // 4. Send via WhatsApp (MSG91)
        const templateId = process.env.MSG91_OTP_TEMPLATE_ID || 'auth_abctoyz';
        let waResponse;

        console.log(`[OTP SEND] Attempting to send OTP to ${cleanPhone} using template: ${templateId}`);

        // Use branded Authentication Template
        // The MSG91 'auth_abctoyz' template expects variable {{1}} for the OTP
        // We also send 'otp' and 'code' to be safe against different template configs
        waResponse = await WhatsAppService.sendTemplateMessage(cleanPhone, templateId, {
            "1": otpCode,
            "otp": otpCode,
            "code": otpCode
        });

        if (!waResponse) {
            console.error('[OTP SEND] WhatsApp delivery failed. Falling back to plain text (caution).');
            const fallbackMessage = `🗝️ *ABC Toyz Verification*\n\nYour login code is: *${otpCode}*\n\nThis code is valid for 5 minutes.`;
            waResponse = await WhatsAppService.sendMessage(cleanPhone, fallbackMessage);
        }

        if (!waResponse) {
            console.error('[OTP SEND] WhatsApp delivery failed');
            return NextResponse.json({ error: 'Failed to deliver OTP via WhatsApp. Check MSG91 configuration.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            // Return template used for debugging (remove in production if needed)
            mode: templateId ? 'template' : 'text'
        });

    } catch (error: any) {
        console.error('[OTP SEND] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
