
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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    console.log("Checking orders for phone: 8000421913");

    // Check order by phone via addresses join
    // Note: We use !inner to filter orders that have a matching address
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id, 
            status, 
            total_amount, 
            created_at,
            shipping_address:addresses!inner(phone, name)
        `)
        .ilike('addresses.phone', '%8000421913%')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching orders:", error);
        return;
    }

    if (orders && orders.length > 0) {
        console.log(`Found ${orders.length} orders:`);
        orders.forEach((o: any) => {
            console.log(`- Order ${o.id}: ${o.status} (₹${o.total_amount}) - Phone: ${o.shipping_address?.phone}`);
        });
    } else {
        console.log("No orders found for this phone number.");
    }
}

checkUser();
