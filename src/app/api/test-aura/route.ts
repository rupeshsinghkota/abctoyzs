
import { NextResponse } from "next/server";
import { AuraService } from "@/lib/services/aura";
import { WhatsAppService } from "@/lib/services/whatsapp";

export async function GET(req: Request) {
    try {
        const sender = "919191919191"; // Dummy number
        const messageText = "Do you have cars in stock?";

        console.log("Testing Aura Flow via GET...");

        // 1. Context
        const userContext = `
# USER CONTEXT
- Phone Number: ${sender}
- Authentication: Test User
`;

        // 2. Generate
        const response = await AuraService.generateResponse(messageText, [], userContext);

        // 3. Attempt Send (Optional - can be disabled to just test AI)
        // await WhatsAppService.sendMessage(sender, response.text);

        return NextResponse.json({
            status: "success",
            env_check: {
                has_gemini: !!process.env.GEMINI_API_KEY,
                has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                has_supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                has_msg91: !!process.env.MSG91_AUTH_KEY
            },
            aura_response: response
        });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
