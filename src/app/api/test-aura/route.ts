
import { NextResponse } from "next/server";
import { AuraService } from "@/lib/services/aura";
import { WhatsAppService } from "@/lib/services/whatsapp";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get('phone');

        const sender = phone || "919191919191";
        const messageText = "Do you have cars in stock?";

        console.log(`Testing Aura Flow via GET for ${sender}...`);

        // 1. Context
        const userContext = `
# USER CONTEXT
- Phone Number: ${sender}
- Authentication: Test User
`;

        // 2. Generate
        const response = await AuraService.generateResponse(messageText, [], userContext);

        // 3. Attempt Send (Only if phone is provided)
        let sendResult = "Skipped (No phone param)";
        if (phone && response.text) {
            console.log("Attempting to send real WhatsApp message...");
            try {
                const res = await WhatsAppService.sendMessage(phone, response.text);
                sendResult = res ? "Success" : "Failed (Check Logs)";
            } catch (e: any) {
                sendResult = `Error: ${e.message}`;
            }
        }

        return NextResponse.json({
            status: "success",
            env_check: {
                has_gemini: !!process.env.GEMINI_API_KEY,
                has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                has_supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                has_msg91: !!process.env.MSG91_AUTH_KEY,
                msg91_sender: process.env.MSG91_SENDER_NUMBER
            },
            aura_response: response,
            send_attempt: sendResult
        });

    } catch (error: any) {

        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
