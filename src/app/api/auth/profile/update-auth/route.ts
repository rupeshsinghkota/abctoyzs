import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { userId, fullName, email } = await request.json();

        if (!userId || !fullName || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Update Profile in public.profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: fullName,
                email: email,
                is_guest: false
            })
            .eq('id', userId);

        if (profileError) throw profileError;

        // 2. Update metadata in Supabase Auth (Optional but recommended for consistency)
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            {
                email: email,
                user_metadata: {
                    full_name: fullName,
                    email_verified: true,
                    phone_verified: true
                },
                email_confirm: true
            }
        );

        if (authError) {
            console.error('[UPDATE AUTH] Auth update error:', authError);
            // If email already exists, we should probably tell the user
            if (authError.message.toLowerCase().includes('already exists') || authError.message.toLowerCase().includes('unique')) {
                return NextResponse.json({
                    error: 'This email is already registered with another account. Please use a different email or contact support.'
                }, { status: 400 });
            }
            // Other auth errors are logged but we might continue if the profile update was critical
        }

        return NextResponse.json({ success: true, message: 'Profile updated successfully' });

    } catch (error: any) {
        console.error('[UPDATE AUTH] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
