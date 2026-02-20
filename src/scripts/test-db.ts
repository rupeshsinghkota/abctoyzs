import { createClient } from "@supabase/supabase-js";

async function checkRoles() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing environment variables");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('role')
        .limit(100);

    if (error) {
        console.error("Error fetching roles:", error);
        return;
    }

    const roles = [...new Set(data?.map(m => m.role))];
    console.log("Distinct roles in DB:", roles);
}

checkRoles();
