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
            .select('id, email, phone, created_at')
            .or(`phone.eq.${phone10},phone.eq.${phone12},phone.eq.${cleanPhone}`);

        if (allProfiles && allProfiles.length > 0) {
            // Fetch Auth details for all candidate profiles to find the most "real" one
            const authUsersPromises = allProfiles.map(p => supabaseAdmin.auth.admin.getUserById(p.id));
            const authResults = await Promise.all(authUsersPromises);

            const candidates = allProfiles.map((p, i) => ({
                profile: p,
                authUser: authResults[i].data?.user
            })).filter(c => c.authUser);

            // Prioritize: 
            // 1. Account with a real email in Auth OR Profile
            // 2. Account with any email
            // 3. Oldest account
            const winner = candidates.find(c =>
                (c.authUser?.email && !c.authUser.email.endsWith('@abctoyz.in')) ||
                (c.profile.email && !c.profile.email.endsWith('@abctoyz.in'))
            ) || candidates.sort((a, b) => {
                const dateA = new Date(a.profile.created_at || 0).getTime();
                const dateB = new Date(b.profile.created_at || 0).getTime();
                return dateA - dateB;
            })[0];

            if (winner) {
                user = winner.authUser;
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
                    u.user_metadata?.phone === phone10 ||
                    u.email === emailPlaceholder
                );
            }
        }

        if (!user) {
            // 3. Create New User in Auth if absolutely not found
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

        // Use the user's actual email for the link generation
        const loginEmail = user.email || emailPlaceholder;

        // 4. Ensure Profile exists in public.profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: user.id,
                phone: cleanPhone,
                full_name: user.user_metadata?.full_name || 'Customer',
                email: loginEmail,
                is_guest: false
            }, { onConflict: 'id' });

        if (profileError) {
            console.error('[OTP VERIFY] Profile sync error:', profileError);
            // Non-blocking for auth, but good to log
        }

        // 5. Generate Session Link
        // We catch the hashed_token and build a direct callback URL.
        // This avoids the fragment (#access_token) issue and uses our server-side callback.
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abctoyz.in';
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: loginEmail
        });

        if (linkError) throw linkError;

        const tokenHash = linkData.properties.hashed_token;
        const callbackUrl = `${siteUrl}/auth/callback?token_hash=${tokenHash}&type=magiclink`;

        // 6. Cleanup OTP
        await supabaseAdmin.from('otp_verifications').delete().eq('phone', cleanPhone);

        // 7. Check if we need more details (Onboarding)
        // If it's a placeholder email, we need a real one.
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
