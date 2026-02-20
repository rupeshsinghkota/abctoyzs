import { createClient } from "@supabase/supabase-js";

async function checkHistory(phone: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing environment variables");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for variations
    const last10 = phone.slice(-10);
    console.log(`Searching for variants of ${phone} (Last 10: ${last10})...`);

    const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .ilike('phone_number', `%${last10}%`)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching history:", error);
        return;
    }

    console.log(`History matches for *${last10}:`);
    data?.forEach(m => {
        console.log(`[${m.created_at}] [${m.phone_number}] ${m.role.toUpperCase()}: ${m.message.substring(0, 50)}`);
    });

    if (!data || data.length === 0) {
        console.log("No specific history found. Showing LATEST 5 messages globally:");
        const { data: latest } = await supabase
            .from('whatsapp_conversations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        latest?.forEach(m => {
            console.log(`[${m.created_at}] [${m.phone_number}] ${m.role.toUpperCase()}: ${m.message.substring(0, 50)}`);
        });
    }
}

const phone = process.argv[2] || "8000421913";
checkHistory(phone);
