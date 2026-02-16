
import { NextResponse } from "next/server";
import { AuraService } from "@/lib/services/aura";
import { WhatsAppService } from "@/lib/services/whatsapp"; // Correct import path
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Incoming WhatsApp Webhook:", JSON.stringify(body, null, 2));

        // robust extraction for MSG91 webhook payload
        // Structure usually:
        // { "sender": "919876543210", "message": "Hello", "type": "text", ... }
        // OR an array

        let sender = "";
        let messageText = "";

        if (Array.isArray(body)) {
            // Handle array if multiple messages come at once
            const msg = body[0];
            sender = msg.sender || msg.from;
            messageText = msg.message || msg.text?.body || "";
        } else {
            sender = body.sender || body.from; // 'sender' is common for MSG91
            messageText = body.message || body.text?.body || "";
        }

        if (!sender || !messageText) {
            console.warn("Invalid Webhook Payload: Missing sender or message");
            return NextResponse.json({ status: "ignored", reason: "missing_fields" });
        }

        // Clean sender number (remove + or spaces)
        sender = sender.replace(/\D/g, "");

        // 🛑 MULTI-TENANT FILTER: Ignore messages NOT meant for AbcToyz
        // AbcToyz Number: 918239269217
        const TARGET_NUMBER = "8239269217"; // Core number
        let rawReceiver = body.receiver || body.integratedNumber || body.integrated_number || "";
        const cleanReceiver = typeof rawReceiver === 'string' ? rawReceiver.replace(/\D/g, "") : "";

        // If receiver is present and DOES NOT contain our core number, ignore it.
        if (cleanReceiver && !cleanReceiver.includes(TARGET_NUMBER)) {
            console.log(`[WhatsApp Webhook] 🛑 Ignoring message for ${rawReceiver} (Clean: ${cleanReceiver}). I am AbcToyz.`);
            return NextResponse.json({ status: "ignored_cross_tenant" });
        }



        // 1. Get User Context (Try to find user by phone number)
        // Use direct client to avoid cookie issues and leverage known working keys
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const supabase = await import("@supabase/supabase-js").then(m => m.createClient(supabaseUrl, supabaseKey));

        // Check if a user exists with this phone number (in 'addresses' link)
        const { data: recentOrders } = await supabase
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

        let userContext = `
# USER CONTEXT
- Phone Number: ${sender}
- Authentication: WhatsApp User (Mobile Verified)
${recentOrders && recentOrders.length > 0 ? `- Recent Orders (Use these IDs for tool calls):
${recentOrders.map((o: any) => `  * Order ID: ${o.id} (Amount: ₹${o.total_amount}, Date: ${new Date(o.created_at).toLocaleDateString()})`).join('\n')}` : "- No recent orders found linked to this phone."}
`;

        console.log("Aura WhatsApp Context:", userContext);

        // 2. Generate Response
        // Pass a dummy history for now, or implement history storage (e.g., in Redis/DB)
        const history: any[] = [];
        const response = await AuraService.generateResponse(messageText, history, userContext);

        // 3. Send Reply
        if (response.text) {
            await WhatsAppService.sendMessage(sender, response.text);
        }

        return NextResponse.json({ status: "success" });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function GET(req: Request) {
    return NextResponse.json({ status: "Webhook Active", timestamp: new Date().toISOString() });
}

