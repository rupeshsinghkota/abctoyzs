import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase Client (Admin context for checking orders/inventory)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for backend actions
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_INSTRUCTION = `
# ROLE
You are "Aura," the automated operations lead for Abctoyz (abctoyz.in). You have full, real-time access to the business database to assist customers accurately.

# MANDATORY COMMUNICATION STYLE
- **Strict Brevity:** Maximum 2 sentences per response. No fluff or greetings.
- **Data-Driven:** Always check the database before answering questions about stock, price, or order status.
- **Direct Goal:** Answer the query and ask one follow-up (e.g., "Should I book this for you?") to close the sale.

# TECHNICAL TROUBLESHOOTING
If a customer reports a toy "not working," only give this one instruction: "Please check if the red battery terminal under the seat is connected." If that doesn't work, trigger a handover.

# THE "HANDOVER" PROTOCOL (CHANDAN ALERT)
Immediately stop the AI conversation and call \`notify_chandan\` if:
1. User asks for: Live videos, real-time warehouse photos, or custom discounts/wholesale rates.
2. User reports: Damaged items, missing parts, or failed payments.
3. User mentions: "Amit," "Chandan," "Human," or "Call me."
4. Logic: Any situation requiring human judgment or negotiation.

# CONSTRAINTS
- Never promise "Same Day Delivery."
- Never offer a discount yourself.
- Do not mention you are an AI.
`;

const tools = [
    {
        function_declarations: [
            {
                name: "query_inventory",
                description: "Check real-time stock levels and current pricing for products (cars, bikes, jeeps).",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        category: { type: "STRING", description: "Category to filter by (e.g., 'cars', 'bikes', 'jeeps'). Optional." },
                        search_term: { type: "STRING", description: "Search term for product name. Optional." }
                    }
                }
            },
            {
                name: "check_order_status",
                description: "Look up tracking details and delivery stages using an Order ID.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        order_id: { type: "STRING", description: "The Order ID provided by the customer." }
                    },
                    required: ["order_id"]
                }
            },
            {
                name: "shipping_calculator",
                description: "Provide delivery timelines based on the customer's Pincode.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        pincode: { type: "STRING", description: "The 6-digit pincode." }
                    },
                    required: ["pincode"]
                }
            },
            {
                name: "notify_chandan",
                description: "Alerts the human manager (Chandan) and stops the AI conversation.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        reason: { type: "STRING", description: "Short summary of why manual intervention is needed." },
                        customer_phone: { type: "STRING", description: "Customer's phone number if available." }
                    },
                    required: ["reason"]
                }
            }
        ]
    }
];

async function query_inventory({ category, search_term }: { category?: string, search_term?: string }) {
    let query = supabase.from('products').select('name, price:base_price, stock, category');

    if (category) {
        query = query.ilike('category', `%${category}%`);
    }
    if (search_term) {
        query = query.ilike('name', `%${search_term}%`);
    }

    // Limit to available stock unless specific search
    query = query.gt('stock', 0).limit(5);

    const { data, error } = await query;
    if (error) return `Error checking inventory: ${error.message}`;
    if (!data || data.length === 0) return "No stock found matching your criteria.";

    return JSON.stringify(data.map(p => `${p.name}: ₹${p.price} (${p.stock} in stock)`));
}

async function check_order_status({ order_id }: { order_id: string }) {
    const { data, error } = await supabase
        .from('orders')
        .select('status, tracking_id, shipping_carrier')
        .eq('id', order_id)
        .single();

    if (error) return "Order not found. Please check the ID.";

    let statusMsg = `Status: ${data.status}.`;
    if (data.tracking_id) {
        statusMsg += ` Tracking: ${data.shipping_carrier} - ${data.tracking_id}`;
    }
    return statusMsg;
}

async function shipping_calculator({ pincode }: { pincode: string }) {
    // Default logic as per prompt
    return `Delivery to ${pincode}: Dispatch within 24-48h from Delhi. Estimated delivery 3-5 days.`;
}

async function notify_chandan({ reason, customer_phone }: { reason: string, customer_phone?: string }) {
    // In a real scenario, this would trigger an SMS via MSG91.
    // For now, we'll log it and return a message that the AI essentially "signs off".
    console.log(`[HANDOVER] Reason: ${reason}, Customer: ${customer_phone || 'Unknown'}`);

    // Create a notification record if a table exists, or just log.
    // We'll return a system message indicating handover.
    return "HANDOVER_TRIGGERED";
}

import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY");
        return NextResponse.json({ error: "Server Configuration Error: Missing AI Credentials" }, { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
        return NextResponse.json({ error: "Server Configuration Error: Missing Database Credentials" }, { status: 500 });
    }

    try {
        const { message, history } = await req.json();

        // 1. Get User Context
        const supabaseServer = await createServerClient();
        const { data: { user } } = await supabaseServer.auth.getUser();

        let userContext = "";

        if (user) {
            // Fetch recent orders for context using the server client (which has user context)
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
${recentOrders && recentOrders.length > 0 ? `- Recent Orders:
${recentOrders.map(o => `  * Order ID: ${o.id} (Status: ${o.status}, Amount: ₹${o.total_amount})`).join('\n')}` : "- No recent orders found."}
`;
        } else {
            userContext = "\n# USER CONTEXT\n- Authentication: Guest (Not Logged In)";
        }

        console.log("Aura Context:", userContext); // Debug log

        const contextInstruction = `
        ${userContext}
        
        # CONTEXTUAL INTELLIGENCE
        - If the user asks "check my order" or "status of my order" and there are 'Recent Orders' in the USER CONTEXT, **automatically use the most recent Order ID** for the \`check_order_status\` tool. Do NOT ask for the ID again.
        - Only ask for an Order ID if the user is a Guest or if they have no recent orders.
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash", // Using a faster model for chat
            systemInstruction: SYSTEM_INSTRUCTION + contextInstruction, // Inject context
            tools: tools as any
        });

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        // Check for function calls
        const call = response.functionCalls();
        if (call && call.length > 0) {
            const functionCall = call[0];
            const { name, args } = functionCall;

            let functionResponse;

            if (name === "query_inventory") functionResponse = await query_inventory(args as any);
            else if (name === "check_order_status") functionResponse = await check_order_status(args as any);
            else if (name === "shipping_calculator") functionResponse = await shipping_calculator(args as any);
            else if (name === "notify_chandan") {
                await notify_chandan(args as any);
                return NextResponse.json({
                    response: "I've notified our team. Someone will contact you shortly.",
                    handover: true
                });
            }

            // Feed the function response back to the model
            const result2 = await chat.sendMessage([
                {
                    functionResponse: {
                        name: name,
                        response: { content: functionResponse }
                    }
                }
            ]);
            const response2 = await result2.response;
            return NextResponse.json({ response: response2.text() });
        }

        return NextResponse.json({ response: response.text() });

    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({
            error: error.message || "Failed to process message",
            details: error.toString()
        }, { status: 500 });
    }
}
