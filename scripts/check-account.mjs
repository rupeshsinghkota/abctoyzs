import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function checkAccount() {
    const phoneFull = '918000421913';
    const phoneShort = '8000421913';
    const email = 'rupeshsinghkota@gmail.com';

    console.log('--- Checking Profiles Table ---');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .or(`phone.eq.${phoneFull},phone.eq.${phoneShort},email.eq.${email}`);

    if (pError) console.error('Profile Error:', pError);
    else console.log('Profiles Found:', JSON.stringify(profiles, null, 2));

    console.log('\n--- Checking Auth Users ---');
    const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();

    if (uError) console.error('Auth User Error:', uError);
    else {
        const matches = users.filter(u =>
            u.phone === phoneFull ||
            u.phone === phoneShort ||
            u.email === email ||
            u.user_metadata?.phone === phoneFull ||
            u.user_metadata?.phone === phoneShort
        );
        console.log('Auth Users Found:', JSON.stringify(matches.map(u => ({
            id: u.id,
            email: u.email,
            phone: u.phone,
            metadata: u.user_metadata
        })), null, 2));
    }
}

checkAccount();
