import { createClient } from "@supabase/supabase-js";

async function checkOutbound() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing env vars");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('phone_number', '918000421913')
        .eq('role', 'model')
        .gte('created_at', oneHourAgo);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} model messages in last hour`);
    data.forEach(m => {
        console.log(`[${m.created_at}] ${m.message}`);
    });
}

checkOutbound();
