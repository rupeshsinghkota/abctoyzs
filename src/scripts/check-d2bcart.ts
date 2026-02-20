import { createClient } from "@supabase/supabase-js";

async function checkD2BCart() {
    // D2BCart Keys from .env.local
    const supabaseUrl = "https://tdkibahqmjycgjkgleoz.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRka2liYWhxbWp5Y2dqa2dsZW96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE2OTgwNSwiZXhwIjoyMDgyNzQ1ODA1fQ.dV1dZ8oUeiPcXqwFxTB9AIFmDSK8kTDhNgbm_8moBWA";

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('whatsapp_chats')
        .select('*')
        .eq('mobile', '918000421913')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} matches in D2BCart DB`);
    data.forEach(m => console.log(`[${m.created_at}] [${m.mobile}] ${m.message}`));
}

checkD2BCart();
