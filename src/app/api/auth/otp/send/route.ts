import { NextResponse } from 'next/server';
import { OTPService } from '@/lib/services/otp';

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
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
