import { createClient } from "@supabase/supabase-js";

async function readDebug() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing env vars");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('phone_number', 'DEBUG')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }

    data.forEach((row, i) => {
        console.log(`\n=== DEBUG ${i} (${row.created_at}) ===`);
        // If it was truncated by the substring(0, 500) in the webhook, we might still be limited
        // But the webhook currently does JSON.stringify(body).substring(0, 500)
        // I need to change THE WEBHOOK to log more.
        console.log(row.message);
    });
}

readDebug();
