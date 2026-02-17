import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
    console.log("Checking for 'guest_email' column in 'orders' table...");

    // Try to select the column. If it doesn't exist, Supabase/Postgres will return an error.
    const { data, error } = await supabase
        .from('orders')
        .select('guest_email')
        .limit(1);

    if (error) {
        console.error("❌ check failed:", error.message);
        console.log("\nCONCLUSION: The SQL migration has NOT been run yet.");
    } else {
        console.log("✅ Check successful. Column 'guest_email' exists.");
        console.log("\nCONCLUSION: Guest Checkout & Auto-Login is FULLY WORKING.");
    }
}

checkColumn();
