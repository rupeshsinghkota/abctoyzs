import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function mergeAccounts() {
    const masterId = '69043d23-4274-4173-ace5-b5242d181777'; // Correct Email in Auth
    const phoneId = 'b11247cb-cffe-43bd-b708-1dd7e5fd7dcf'; // Phone and correct Name in Profile
    const phoneNum = '918000421913';
    const email = 'rupeshsinghkota@gmail.com';
    const fullName = 'Rupesh singh';

    console.log('--- Phase 1: Cleaning Phone Account ---');
    // Remove phone from the secondary account so it doesn't conflict
    const { error: e1 } = await supabase.auth.admin.updateUserById(phoneId, {
        phone: '', // Clear it
        user_metadata: { phone: '' }
    });
    if (e1) console.error('Error clearing phone from secondary:', e1.message);
    else console.log('Successfully cleared phone from secondary account.');

    console.log('--- Phase 2: Updating Master Account ---');
    // Give phone and metadata to the master account
    const { error: e2 } = await supabase.auth.admin.updateUserById(masterId, {
        phone: phoneNum,
        user_metadata: {
            full_name: fullName,
            phone: phoneNum,
            phone_verified: true
        }
    });
    if (e2) console.error('Error updating master account auth:', e2.message);
    else console.log('Successfully updated master auth with phone and name.');

    console.log('--- Phase 3: Syncing Profiles Table ---');
    // Ensure the master profile is perfect
    const { error: e3 } = await supabase
        .from('profiles')
        .upsert({
            id: masterId,
            full_name: fullName,
            email: email,
            phone: phoneNum,
            is_guest: false
        }, { onConflict: 'id' });

    if (e3) console.error('Error syncing master profile:', e3.message);
    else console.log('Successfully synced master profile table.');

    console.log('--- Migration Complete ---');
}

mergeAccounts();
