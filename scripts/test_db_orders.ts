
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load Env
const envPath = path.resolve(process.cwd(), ".env.local");
const envFile = fs.readFileSync(envPath, "utf8");
const envVars = envFile.split("\n").reduce((acc: any, line: string) => {
    const [key, value] = line.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase Credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    const sender = "919999999999"; // Dummy phone
    console.log(`Checking orders for phone like %${sender}%...`);

    try {
        const { data: recentOrders, error } = await supabase
            .from('orders')
            .select(`
                id, 
                status, 
                total_amount, 
                created_at,
                shipping_address:addresses!inner(phone)
            `)
            .ilike('addresses.phone', `%${sender}%`)
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error("Query Error:", error);
        } else {
            console.log("Query Success! Found:", recentOrders?.length);
            console.log(JSON.stringify(recentOrders, null, 2));
        }

    } catch (e) {
        console.error("Execution Error:", e);
    }
}

checkOrders();
