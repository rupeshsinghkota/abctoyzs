
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
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; // Trying ANON first

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log("Inspecting 'addresses' table schema...");
    const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching addresses:", error);
    } else if (addresses && addresses.length > 0) {
        console.log("Addresses Keys:", Object.keys(addresses[0]));
    } else {
        console.log("No addresses found or table empty.");
    }

    console.log("Inspecting 'orders' table schema...");
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (orderError) {
        console.error("Error fetching orders:", orderError);
    } else if (orders && orders.length > 0) {
        console.log("Orders Keys:", Object.keys(orders[0]));
    }
}

inspectSchema();
