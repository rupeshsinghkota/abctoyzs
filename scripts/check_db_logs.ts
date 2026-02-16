
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

async function checkLogs() {
    console.log("Checking last 5 messages in whatsapp_chats...");
    const { data: messages, error } = await supabase
        .from('whatsapp_chats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching chats:", error);
    } else {
        console.log("Recent Messages:");
        messages.forEach((msg: any) => {
            console.log(`[${msg.created_at}] ${msg.direction}: ${msg.message} (Status: ${msg.status})`);
            console.log(`   Metadata:`, JSON.stringify(msg.metadata).slice(0, 100) + "...");
        });
    }
}

checkLogs();
