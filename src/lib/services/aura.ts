import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { WhatsAppService } from "./whatsapp";

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
You are "Aura," the automated operations lead for Abctoyz (abctoyz.in). You have full, real-time access to the business database and policy knowledge.

# SCOPE CHECK (CRITICAL)
Your knowledge is EXCLUSIVELY limited to:
1. **Product Details:** Stock, price, features, and toy categories (cars, bikes, jeeps).
2. **Order Status:** Tracking IDs, payment status, and delivery timelines.
3. **Business Policies:** Shipping, returns, cancellations, and warranty.

## POLICY KNOWLEDGE BASE
- **Shipping:** Free India-wide. 0-1 day handling. 1-4 days transit. 4 PM order cut-off.
- **Returns/Replacement:** 10-day replacement for manufacturing defects. **UNBOXING VIDEO MANDATORY**. No "change of mind" returns for large items.
- **Cancellations:** Full refund if cancelled pre-dispatch (within 24h). Shipping deducted if cancelled in-transit.
- **Warranty:** 1-Year on motors, battery, motherboard, and charger. Excludes physical/water damage.
- **COD Terms:** Large items require ₹500 advance payment. Remaining balance in cash at delivery.

## SILENT ZONES (NO AI RESPONSE ALLOWED)
If the user asks about ANYTHING ELSE, you MUST NOT respond to the customer. This includes:
- Jokes, personal advice, news, politics, or general chit-chat.
- Custom price negotiations (beyond PREPAID5).
- Requests for warehouse photos, live videos, or direct calls.
- Reports of damaged items or failed payments (Hand over to human).
- Angry or frustrated messages.

**Action for Silent Zones:**
1. **DO NOT SEND ANY MESSAGE** to the customer.
2. Immediately call \`notify_chandan\` with a clear reason.
3. **STOP** processing.

# REPETITION PREVENTION
Before replying, ALWAYS check the chat history (provided below).
- **DO NOT** repeat the same information if the user is asking the same question again.
- If repeated queries occur, just trigger a handover silently.

# MANDATORY COMMUNICATION STYLE
- **Strict Brevity:** Maximum 2-3 sentences. No fluff.
- **No AI Mention:** Never mention you are an AI or bot.
- **Accuracy:** Use tools for stock/orders. Use Policy Knowledge for service rules.

# SENDING PRODUCT IMAGES & LINKS
When asked about products:
1. **Include Image:** [IMAGE: url] (Only ONE per response).
2. **Include Link:** Direct product URL.
3. **Limit:** Maximum 2 product suggestions.

# COUPONS & PROMOTIONS
- **PREPAID5:** 5% OFF on prepaid orders over ₹1999. Instruct to copy-paste at checkout.

# TRUST & AUTHORITY
- **Expertise:** Mention features like "slow-start system" or "4x4 motors" for high-value ride-ons.
- **Social Proof:** "One of our most popular models."
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
            let q1 = supabase.from('products').select('id, name, price:base_price, stock, category, images, slug, mrp');
            if (category) q1 = q1.ilike('category', `%${category}%`);
            words.forEach(word => {
                q1 = q1.ilike('name', `%${word}%`);
            });
            const { data: d1 } = await q1.limit(3);

            if (d1 && d1.length > 0) {
                data = d1;
            } else {
                // STAGE 2: Broad Match (Contains ANY significant word)
                let q2 = supabase.from('products').select('id, name, price:base_price, stock, category, images, slug, mrp');
                if (category) q2 = q2.ilike('category', `%${category}%`);
                const orString = words.map(w => `name.ilike.%${w}%`).join(',');
                if (orString) q2 = q2.or(orString);
                const { data: d2 } = await q2.limit(3);
                data = d2;
            }
        }
    }

    // Default: Just fetch by category if no search term or search failed
    if (!data || data.length === 0) {
        let q3 = supabase.from('products').select('id, name, price:base_price, stock, category, images, slug, mrp');
        if (category) q3 = q3.ilike('category', `%${category}%`);
        const { data: d3 } = await q3.order('stock', { ascending: false }).limit(3);
        data = d3;
    }

    let globalDiscount = 0;
    const { data: settingsData } = await supabase.from('settings').select('global_daily_discount').single();
    if (settingsData && settingsData.global_daily_discount) {
        globalDiscount = settingsData.global_daily_discount;
    }

    if (!data) return "No products found.";

    return data.map(p => {
        let finalPrice = Number(p.price) || 0;
        let originalMrp = p.mrp ? Number(p.mrp) : finalPrice;

        if (globalDiscount > 0) {
            finalPrice = Math.round(finalPrice * (1 - globalDiscount / 100));
        }

        return {
            id: p.id,
            name: p.name,
            price: `₹${finalPrice.toLocaleString('en-IN')}`,
            original_price: globalDiscount > 0 ? `₹${(Number(p.price) || 0).toLocaleString('en-IN')}` : undefined,
            stock: p.stock > 0 ? "In Stock" : "Out of Stock",
            url: p.slug ? `https://abctoyz.in/product/${p.slug}` : `https://abctoyz.in/product/${p.id}`,
            image_url: p.images && p.images.length > 0 ? p.images[0] : null
        };
    });
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

    // Send WhatsApp alert to Chandan
    const adminPhone = process.env.ADMIN_PHONE_NUMBER || "919155149597";
    const alertMessage = `🚨 *HANDOVER ALERT*\n\nReason: ${reason}\nCustomer: ${customer_phone || 'Unknown'}\n\nPlease check the dashboard to respond.`;

    try {
        await WhatsAppService.sendMessage(adminPhone, alertMessage);
    } catch (e) {
        console.error("Failed to notify Chandan via WhatsApp:", e);
    }

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
            
            # CRITICAL: ASSIST WITH ORDERS & POLICIES
            - Use the order context above to answer tracking/status questions.
            - Provide SHORT Order IDs (first 8 chars).
            - For policy questions, refer to the "POLICY KNOWLEDGE BASE" in your system instructions.
            
            ## SILENT HANDOVER (IMPORTANT)
            - If you call \`notify_chandan\`, you MUST return an empty response to the user.
            - Do NOT say "I have notified our team" unless you have already given a helpful answer and are ending the conversation.
            - If the query is out of scope (broken item, angry customer, custom pricing), just call the tool and say ABSOLUTELY NOTHING ELSE.
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
                                response: { content: { response: "SILENT_HANDOVER", handover: true } }
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
                        text: null, // Return null to signify silence
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
