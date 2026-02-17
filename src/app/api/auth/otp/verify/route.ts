import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');
        const phone10 = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
        const phone12 = `91${phone10}`;

        // 1. Verify OTP from database
        const { data: verification, error: fetchError } = await supabaseAdmin
            .from('otp_verifications')
            .select('*')
            .or(`phone.eq.${cleanPhone},phone.eq.${phone10},phone.eq.${phone12}`)
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

        const emailPlaceholder = `${phone12}@abctoyz.in`;
        let user;

        // 3. Check public.profiles for ANY match (10 or 12 digits)
        const { data: allProfiles, error: profileSearchError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, phone, created_at, full_name')
            .or(`phone.eq.${phone10},phone.eq.${phone12},phone.eq.${cleanPhone}`);

        if (allProfiles && allProfiles.length > 0) {
            // Fetch Auth details for all candidate profiles
            const authUsersPromises = allProfiles.map(p => supabaseAdmin.auth.admin.getUserById(p.id));
            const authResults = await Promise.all(authUsersPromises);

            const candidates = allProfiles.map((p, i) => ({
                profile: p,
                authUser: authResults[i].data?.user
            })).filter(c => c.authUser);

            // Winner logic:
            // 1. Account with a real email in Supabase Auth (highest priority)
            // 2. Account with a real email in Profile
            // 3. Oldest account
            const winner = candidates.find(c => c.authUser?.email && !c.authUser.email.endsWith('@abctoyz.in')) ||
                candidates.find(c => c.profile.email && !c.profile.email.endsWith('@abctoyz.in')) ||
                candidates.sort((a, b) => {
                    const dateA = new Date(a.profile.created_at || 0).getTime();
                    const dateB = new Date(b.profile.created_at || 0).getTime();
                    return dateA - dateB;
                })[0];

            if (winner) {
                user = winner.authUser;
                // If the Auth user email is different from our placeholder, update loginEmail
                if (user && user.email && !user.email.endsWith('@abctoyz.in')) {
                    // This is our master email
                }
            }
        }

        if (!user) {
            // 4. Fallback: Search all auth users by phone variants
            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            if (!listError) {
                user = users.find(u =>
                    u.phone === phone12 ||
                    u.phone === phone10 ||
                    u.user_metadata?.phone === phone12 ||
                    u.user_metadata?.phone === phone10
                );
            }
        }

        if (!user) {
            // 5. Create New User in Auth if absolutely not found
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

        if (!user) {
            throw new Error('User resolution failed');
        }

        // Final Resolution: Determine the authoritative email for this session
        const loginEmail = user.email || emailPlaceholder;

        // 6. Force Profile sync for the SELECTED user
        // Ensure the profile table exactly matches what we found in Auth or are about to use
        await supabaseAdmin
            .from('profiles')
            .upsert({
                id: user.id,
                phone: cleanPhone,
                full_name: user.user_metadata?.full_name || 'Customer',
                email: loginEmail,
                is_guest: false
            }, { onConflict: 'id' });

        // 7. Generate Session Link
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abctoyz.in';
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: loginEmail
        });

        if (linkError) throw linkError;

        const tokenHash = linkData.properties.hashed_token;
        const callbackUrl = `${siteUrl}/auth/callback?token_hash=${tokenHash}&type=magiclink`;

        // 8. Cleanup OTP
        await supabaseAdmin.from('otp_verifications').delete().eq('phone', cleanPhone);

        // 9. Check if we need more details (Onboarding)
        const requireOnboarding = loginEmail.endsWith('@abctoyz.in');

        return NextResponse.json({
            success: true,
            session_link: callbackUrl,
            user: user,
            require_onboarding: requireOnboarding
        });

    } catch (error: any) {
        console.error('[OTP VERIFY] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
