import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');

        // 1. Verify OTP from database
        const { data: verification, error: fetchError } = await supabaseAdmin
            .from('otp_verifications')
            .select('*')
            .eq('phone', cleanPhone)
            .eq('otp_code', code)
            .single();

        if (fetchError || !verification) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // 2. Check expiry
        if (new Date(verification.expires_at) < new Date()) {
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // 3. Authenticate User (Supabase Auth)
        // We use the phone number as the primary identifier. 
        // We'll search for existing user by phone. 
        // Note: Supabase Auth users can have phone as their identity.

        // Let's try to get the user by phone
        // We'll use the cleanPhone (e.g. 918239269217)
        // We should ensure it has leading + for Supabase Auth consistency if possible, 
        // but here we'll stick to what we have.

        const emailPlaceholder = `${cleanPhone}@abctoyz.in`;

        // Attempt to find user by phone in auth metadata or email placeholder
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        let user = users.find(u => u.phone === cleanPhone || u.email === emailPlaceholder || u.user_metadata?.phone === cleanPhone);

        if (!user) {
            // Create New User in Auth
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: emailPlaceholder,
                phone: cleanPhone,
                user_metadata: {
                    phone: cleanPhone,
                    full_name: 'Customer',
                    email_verified: true,
                    phone_verified: true
                },
                email_confirm: true,
                phone_confirm: true
            });
            if (createError) throw createError;
            user = newUser.user;
        }

        // 4. Ensure Profile exists in public.profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: user.id,
                phone: cleanPhone,
                full_name: user.user_metadata?.full_name || 'Customer',
                email: emailPlaceholder,
                is_guest: false
            }, { onConflict: 'id' });

        if (profileError) {
            console.error('[OTP VERIFY] Profile sync error:', profileError);
            // Non-blocking for auth, but good to log
        }

        // 5. Generate Session Link
        // We use the auth/callback route to ensure cookies are set server-side
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abctoyz.in';
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: emailPlaceholder,
            options: {
                redirectTo: `${siteUrl}/auth/callback`
            }
        });

        if (linkError) throw linkError;

        // 6. Cleanup OTP
        await supabaseAdmin.from('otp_verifications').delete().eq('phone', cleanPhone);

        return NextResponse.json({
            success: true,
            session_link: linkData.properties.action_link,
            user: user
        });

    } catch (error: any) {
        console.error('[OTP VERIFY] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
