import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function deepCheck() {
    const phone12 = '918000421913';
    const phone10 = '8000421913';
    const email = 'rupeshsinghkota@gmail.com';

    console.log('--- ALL PROFILES ---');
    const { data: profiles } = await supabase.from('profiles').select('*');
    const matches = profiles.filter(p =>
        p.phone === phone12 || p.phone === phone10 || p.email === email
    );
    console.log(JSON.stringify(matches, null, 2));

    console.log('\n--- ALL AUTH USERS ---');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const authMatches = users.filter(u =>
        u.phone === phone12 || u.phone === phone10 || u.email === email || u.user_metadata?.phone === phone12 || u.user_metadata?.phone === phone10
    );
    console.log(JSON.stringify(authMatches.map(u => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        metadata: u.user_metadata
    })), null, 2));
}

deepCheck();
