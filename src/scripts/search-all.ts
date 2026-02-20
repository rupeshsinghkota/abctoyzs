import { createClient } from "@supabase/supabase-js";

async function searchAll() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .ilike('message', '%still testing%');

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} matches`);
    data.forEach(m => console.log(`[${m.created_at}] [${m.phone_number}] ${m.message}`));
}

searchAll();
