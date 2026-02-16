import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { AuraService } from "@/lib/services/aura";

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Server Configuration Error: Missing AI Credentials" }, { status: 500 });
    }

    try {
        const { message, history } = await req.json();

        // 1. Get User Context
        const supabaseServer = await createServerClient();
        const { data: { user } } = await supabaseServer.auth.getUser();

        let userContext = "";

        if (user) {
            // Fetch recent orders for context
            const { data: recentOrders } = await supabaseServer
                .from('orders')
                .select('id, status, total_amount, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);

            userContext = `
# USER CONTEXT
- User ID: ${user.id}
- Authentication: Logged In
${recentOrders && recentOrders.length > 0 ? `- Recent Orders (Use these IDs for tool calls):
${recentOrders.map(o => `  * Order ID: ${o.id} (Amount: ₹${o.total_amount}, Date: ${new Date(o.created_at).toLocaleDateString()})`).join('\n')}` : "- No recent orders found."}
`;
        } else {
            userContext = "\n# USER CONTEXT\n- Authentication: Guest (Not Logged In)";
        }

        // 2. Generate Response using AuraService
        const response = await AuraService.generateResponse(message, history, userContext);

        return NextResponse.json({
            response: response.text,
            handover: response.handover
        });

    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({
            error: error.message || "Failed to process message",
            details: error.toString()
        }, { status: 500 });
    }
}
