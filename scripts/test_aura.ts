
import { AuraService } from '@/lib/services/aura';
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

// Mock Env
process.env.GEMINI_API_KEY = envVars.GEMINI_API_KEY;
process.env.NEXT_PUBLIC_SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

async function testAura() {
    console.log("Testing Aura Response...");
    const userContext = `
# USER CONTEXT
- Phone Number: 919999999999
- Authentication: WhatsApp User
`;
    try {
        const response = await AuraService.generateResponse("Hello, do you have cars?", [], userContext);
        console.log("Aura Response:", JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Aura Error:", error);
    }
}

testAura();
