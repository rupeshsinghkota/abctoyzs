import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Helper to get Supabase Client
function getSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    // Use Service Role Key for Admin Access (Aura needs to see all data)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase credentials missing");
    }
    return createClient(supabaseUrl, supabaseKey);
}



// Helper to get Gemini Client
function getGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
    return new GoogleGenerativeAI(apiKey);
}

const SYSTEM_INSTRUCTION = `
# ROLE
You are "Aura," the automated operations lead for Abctoyz (abctoyz.in). You have full, real-time access to the business database to assist customers accurately.

# MANDATORY COMMUNICATION STYLE
- **Strict Brevity:** Maximum 2-3 sentences per response. No fluff.
- **Personalization:** If you see a customer name in context, use it naturally in your greeting (e.g., "Hi [Name]!").
- **Customer Recognition:** If you see "Recent Orders" in context, acknowledge the customer briefly ("Welcome back!").
- **Data-Driven:** Always check the database before answering questions about stock, price, or order status.
- **Direct Goal:** Answer the query and ask one follow-up (e.g., "Should I book this for you?") to close the sale.
- **Natural Formatting:** When showing products, format them as a clean list (bullets or numbered), not raw JSON.

# CUSTOMER AWARENESS
- **Returning Customers:** If User Context shows recent orders, greet briefly ("Welcome back! I see your last order was on [date]").
- **New Customers:** If no orders in context, be friendly but direct ("Hi! Looking for a ride-on toy?").
- **Don't Over-Query:** If user just says "Hi" or greets you, respond warmly WITHOUT calling check_order_status unless they ASK about their order.

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

// --- Tool Implementations ---

async function query_inventory({ category, search_term }: { category?: string, search_term?: string }) {
    const supabase = getSupabase();
    let data: any[] | null = null;

    if (search_term) {
        // CLEANING: Remove generic brand words that clutter search
        const cleanTerm = search_term.replace(/ABC Toyz|abctoyz\.in|Premium|Adventure!|!/gi, '').trim();
        const words = cleanTerm.split(/\s+/).filter(word => word.length >= 2);

        if (words.length > 0) {
            // STAGE 1: Precise Match (Contains ALL significant words)
            let q1 = supabase.from('products').select('id, name, price:base_price, stock, category, images, slug');
            if (category) q1 = q1.ilike('category', `%${category}%`);
            words.forEach(word => {
                q1 = q1.ilike('name', `%${word}%`);
            });
            const { data: d1 } = await q1.limit(10);

            if (d1 && d1.length > 0) {
                data = d1;
            } else {
                // STAGE 2: Broad Match (Contains ANY significant word)
                let q2 = supabase.from('products').select('id, name, price:base_price, stock, category, images, slug');
                if (category) q2 = q2.ilike('category', `%${category}%`);
                const orString = words.map(w => `name.ilike.%${w}%`).join(',');
                const { data: d2 } = await q2.or(orString).order('stock', { ascending: false }).limit(10);
                data = d2;
            }
        }
    }

    // Default: Just fetch by category if no search term or search failed
    if (!data || data.length === 0) {
        let q3 = supabase.from('products').select('id, name, price:base_price, stock, category, images, slug');
        if (category) q3 = q3.ilike('category', `%${category}%`);
        const { data: d3 } = await q3.order('stock', { ascending: false }).limit(10);
        data = d3;
    }

    if (!data || data.length === 0) {
        return "I couldn't find any products matching those details. Could you describe it differently?";
    }

    // Return structured data for AI to process
    return JSON.stringify(data.map(p => ({
        name: p.name,
        price: p.price,
        stock: p.stock > 0 ? p.stock : "Out of Stock",
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
        url: `https://abctoyz.in/product/${p.slug}`
    })));
}

async function check_order_status({ order_id }: { order_id: string }) {
    const supabase = getSupabase();
    // 1. Fetch Order Details
    const { data: order, error } = await supabase
        .from('orders')
        .select('status, tracking_id, shipping_carrier, total_amount, created_at')
        .eq('id', order_id)
        .single();

    if (error) return "Order not found. Please check the ID.";

    // 2. Fetch Order Items for context
    const { data: items } = await supabase
        .from('order_items')
        .select('product_name, quantity')
        .eq('order_id', order_id);

    const itemSummary = items && items.length > 0
        ? items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')
        : 'items';

    let statusMsg = `Order for ${itemSummary} (Total: ₹${order.total_amount}) is currently ${order.status}.`;

    if (order.tracking_id) {
        statusMsg += ` Tracking: ${order.shipping_carrier || 'Courier'} - ${order.tracking_id}`;
    }

    return statusMsg;
}

async function shipping_calculator({ pincode }: { pincode: string }) {
    // Default logic as per prompt
    return `Delivery to ${pincode}: Dispatch within 24-48h from Delhi. Estimated delivery 3-5 days.`;
}

async function notify_chandan({ reason, customer_phone }: { reason: string, customer_phone?: string }) {
    console.log(`[HANDOVER] Reason: ${reason}, Customer: ${customer_phone || 'Unknown'}`);
    return "HANDOVER_TRIGGERED";
}

// --- Main Service Class ---

export const AuraService = {
    /**
     * Generates a response from Aura given the user message and history.
     * @param message User's input message
     * @param history Chat history (array of { role, parts: [{ text }] })
     * @param context Additional context string (e.g., user info, orders)
     */
    async generateResponse(message: string, history: any[], context: string = "") {
        if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

        try {
            console.log("Aura Context:", context);

            const contextInstruction = `
            ${context}
            
            # CRITICAL: USE CONTEXT FIRST, TOOLS SECOND
            - The User Context above contains COMPLETE order details: Order IDs, items, quantities, prices, status, tracking, payment info.
            - **NEVER ask the user for an Order ID.** You already have all Order IDs in the context above (marked with "← USE THIS ID").
            - **NEVER call tools if the answer is already in the User Context above.**
            - **When referencing Order IDs to customers, use SHORT format:** First 8 characters only (e.g., "Order #8b8ca30c" instead of full UUID)
            
            ## When User Asks About Delivery/Shipment:
            1. Identify which order they're asking about (match product name to items in context)
            2. Find the Order ID for that product
            3. Check if "Delivery" field has tracking info
            4. If tracking exists: Provide tracking number and carrier
            5. If "Tracking not yet assigned": Tell them order is still processing, no tracking yet
            6. **DO NOT ask for Order ID** - you already know it!
            7. **Reference orders using SHORT IDs** (first 8 characters)
            
            ## Examples:
            - User: "When will 6V scooter reach me?" 
              → Find order with "6V Scooter" in items → Use that Order ID → Check tracking → Answer: "Your scooter order (#8b8ca30c) is still processing..."
            - User: "Where is my Jeep?" 
              → Find order with "Jeep" in items → Answer: "Your Jeep order (#e0f7bb8c) is being shipped via..."
            
            ## Tool Usage:
            - **ONLY call \`check_order_status\` if:** User explicitly says "refresh" or "update" AND you need real-time tracking.
            - **ONLY call \`query_inventory\` if:** User asks about products NOT in their order history.
            - For greetings ("Hi", "Hello"), respond warmly WITHOUT any tool calls.
            `;



            const genAI = getGemini();
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: SYSTEM_INSTRUCTION + contextInstruction,
                tools: tools as any
            });

            const chat = model.startChat({
                history: history || [],
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;

            // Check for function calls
            const calls = response.functionCalls();
            if (calls && calls.length > 0) {
                // Execute ALL function calls
                const functionResponses = await Promise.all(calls.map(async (call) => {
                    const { name, args } = call;
                    let functionResponse;

                    if (name === "query_inventory") functionResponse = await query_inventory(args as any);
                    else if (name === "check_order_status") functionResponse = await check_order_status(args as any);
                    else if (name === "shipping_calculator") functionResponse = await shipping_calculator(args as any);
                    else if (name === "notify_chandan") {
                        await notify_chandan(args as any);
                        return {
                            functionResponse: {
                                name: name,
                                response: { content: { response: "I've notified our team. Someone will contact you shortly.", handover: true } }
                            }
                        };
                    }

                    return {
                        functionResponse: {
                            name: name,
                            response: { name: name, content: functionResponse }
                        }
                    };
                }));

                // Check if any response triggered a handover
                const handoverResponse = functionResponses.find(r => (r.functionResponse.response.content as any)?.handover);
                if (handoverResponse) {
                    return {
                        text: "I've notified our team. Someone will contact you shortly.",
                        handover: true
                    };
                }

                // Feed ALL function responses back to the model
                const result2 = await chat.sendMessage(functionResponses);
                const response2 = await result2.response;
                return { text: response2.text() };
            }

            return { text: response.text() };

        } catch (error: any) {
            console.error("Aura Service Error:", error);
            throw error;
        }
    }
};
