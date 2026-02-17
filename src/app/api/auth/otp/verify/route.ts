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
            // Create New User
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: emailPlaceholder,
                phone: cleanPhone,
                user_metadata: { phone: cleanPhone, full_name: 'Customer' },
                email_confirm: true,
                phone_confirm: true
            });
            if (createError) throw createError;
            user = newUser.user;
        }

        // 4. Generate Session
        // Since we are in an API route, we can't easily "log in" the user for the browser here directly 
        // via setSession (which usually happens on client).
        // But we can return the user data and potentially a magic link or just handle the login on the client
        // after verification.

        // Actually, Supabase has signInWithOtp but it expects SMS. 
        // Since we verified custom, we can create a custom session or just return success and handle
        // client-side "login" by storing the phone in local storage and using it for subsequent requests
        // OR we can use admin.generateLink but that's for email usually.

        // BETTER APPROACH: Use Supabase's admin.createSession or just use a secret password?
        // Let's use a secret password for phone-based users (hashed phone or something)
        // Actually, let's just use `supabaseAdmin.auth.admin.generateLink` for 'magiclink'? 
        // No, let's use `supabaseAdmin.auth.admin.updateUserById` to set a random password and return it? No.

        // Let's use `supabaseAdmin.auth.admin.createSession` if available (it's not).

        // OK, let's use the standard way: 
        // 1. We create the user with a known (to us) password if they are new.
        // 2. Or we return a "one-time-login-token" if we can.

        // Alternative: Return success and have the client use a "master key" or just trust our API?
        // Modern approach: Use `supabase.auth.signInWithOtp` on the client, BUT we already sent the OTP.

        // Let's do this: 
        // In the verify API, if successful, we return a short-lived token or just the user data.
        // Actually, let's use `supabaseAdmin.auth.admin.generateLink` with type 'signup' or 'magiclink'.

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: emailPlaceholder
        });

        if (linkError) throw linkError;

        // 5. Cleanup OTP
        await supabaseAdmin.from('otp_verifications').delete().eq('phone', cleanPhone);

        return NextResponse.json({
            success: true,
            session_link: linkData.properties.action_link, // The client can use this to sign in
            user: user
        });

    } catch (error: any) {
        console.error('[OTP VERIFY] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
