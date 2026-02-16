
import { NextResponse } from "next/server";
import { AuraService } from "@/lib/services/aura";
import { WhatsAppService } from "@/lib/services/whatsapp"; // Correct import path
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        console.log("Incoming WhatsApp Webhook Raw:", rawBody);

        let body: any = {};
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            console.warn("Failed to parse JSON body, trying URLSearchParams");
            try {
                const params = new URLSearchParams(rawBody);
                const entries: any = {};
                for (const [key, value] of params) {
                    entries[key] = value;
                }
                body = entries;
            } catch (formError) {
                console.error("Failed to parse as form data");
            }
        }

        // Wrapper for Array handling
        const payload = Array.isArray(body) ? body[0] : body;

        // Extract fields
        let sender = payload.sender || payload.from || payload.mobile || payload.customerNumber || "";
        let messageText = payload.message || payload.text?.body || payload.content || payload.text || "";



        if (!sender || !messageText) {
            console.log("[WhatsApp] Ignored: Missing sender or message.");
            return NextResponse.json({ status: "ignored" });
        }

        // Normalize sender (remove non-digits)
        sender = sender.replace(/\D/g, "");

        console.log(`[WhatsApp] Processing message from ${sender}: "${messageText}"`);

        // DEDUPLICATION: Check if we processed this exact message recently (within 2 minutes)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const supabase = await import("@supabase/supabase-js").then(m => m.createClient(supabaseUrl, supabaseKey));

        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        const { data: recentMessages } = await supabase
            .from('whatsapp_conversations')
            .select('message, created_at')
            .eq('phone_number', sender)
            .eq('role', 'user')
            .eq('message', messageText)
            .gte('created_at', twoMinutesAgo)
            .limit(1);

        if (recentMessages && recentMessages.length > 0) {
            console.log(`[WhatsApp] DUPLICATE detected: Same message already processed at ${recentMessages[0].created_at}`);
            return NextResponse.json({ status: "duplicate" });
        }

        // 🛑 MULTI-TENANT FILTER: Ignore messages NOT meant for AbcToyz
        // AbcToyz Number: 918239269217
        const TARGET_NUMBER = "8239269217"; // Core number
        let rawReceiver = body.receiver || body.integratedNumber || body.integrated_number || "";
        const cleanReceiver = typeof rawReceiver === 'string' ? rawReceiver.replace(/\D/g, "") : "";

        // If receiver is present and DOES NOT contain our core number, ignore it.
        if (cleanReceiver && !cleanReceiver.includes(TARGET_NUMBER)) {
            console.log(`[WhatsApp Webhook] 🛑 Ignoring message for ${rawReceiver} (Clean: ${cleanReceiver}). I am AbcToyz.`);
            return NextResponse.json({ status: "ignored", reason: "wrong_number" });
        }

        // 1. Build Context (Customer Info + Orders)
        // (Supabase client already initialized above for deduplication)

        // Check if a user exists with this phone number (search in addresses linked to orders)
        console.log(`[Context] Fetching orders for phone: ${sender}`);

        // Try multiple phone number variations for better matching
        const phoneVariations = [
            sender,                                    // 918239269217
            sender.substring(2),                       // 8239269217 (without 91)
            sender.substring(0, 2) + ' ' + sender.substring(2), // 91 8239269217
        ];

        console.log(`[Context] Trying phone variations:`, phoneVariations);

        // First, find addresses with this phone number (include name)
        let matchingAddresses = null;
        let customerName = null;
        for (const phonePattern of phoneVariations) {
            const { data, error: addrError } = await supabase
                .from('addresses')
                .select('id, name')
                .ilike('phone', `%${phonePattern}%`);

            if (addrError) {
                console.error(`[Context] Address lookup error for ${phonePattern}:`, addrError);
                continue;
            }

            if (data && data.length > 0) {
                console.log(`[Context] Found ${data.length} addresses with pattern: ${phonePattern}`);
                matchingAddresses = data;
                customerName = data[0].name; // Get name from first matching address
                break; // Stop on first match
            }
        }


        let recentOrders = null;
        let orderError = null;

        if (matchingAddresses && matchingAddresses.length > 0) {
            const addressIds = matchingAddresses.map(a => a.id);
            console.log(`[Context] Found ${addressIds.length} matching addresses`);

            // Fetch orders with FULL details
            const result = await supabase
                .from('orders')
                .select(`
                    id, 
                    status,
                    payment_status,
                    total_amount, 
                    created_at,
                    tracking_id,
                    shipping_carrier,
                    payment_method,
                    user_id
                `)
                .in('shipping_address_id', addressIds)
                .order('created_at', { ascending: false })
                .limit(5);

            recentOrders = result.data;
            orderError = result.error;

            // Fetch order items for all orders
            if (recentOrders && recentOrders.length > 0) {
                const orderIds = recentOrders.map(o => o.id);
                const { data: allItems } = await supabase
                    .from('order_items')
                    .select('order_id, product_name, quantity, price')
                    .in('order_id', orderIds);

                // Attach items to each order
                recentOrders = recentOrders.map(order => ({
                    ...order,
                    items: allItems?.filter(item => item.order_id === order.id) || []
                }));
            }

            // Fetch customer profile if user_id exists
            if (recentOrders && recentOrders.length > 0 && recentOrders[0].user_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email, phone')
                    .eq('id', recentOrders[0].user_id)
                    .single();

                if (profile) {
                    console.log(`[Context] Found customer profile:`, profile);
                }
            }
        }

        if (orderError) {
            console.error(`[Context] Order fetch error:`, orderError);
        } else {
            console.log(`[Context] Found ${recentOrders?.length || 0} orders for ${sender}`);
        }

        // Build RICH context with full customer data
        let userContext = `
# USER CONTEXT
- Customer Name: ${customerName || 'Customer'}
- Phone Number: ${sender}
- Authentication: WhatsApp User (Mobile Verified)
`;

        if (recentOrders && recentOrders.length > 0) {
            userContext += `\n## CUSTOMER ORDERS (Full Details)\n`;
            recentOrders.forEach((order: any) => {
                const itemsList = order.items.map((i: any) => `${i.quantity}x ${i.product_name} (₹${i.price})`).join(', ');
                userContext += `
### Order #${order.id}
- Date: ${new Date(order.created_at).toLocaleDateString()}
- Items: ${itemsList || 'N/A'}
- Total: ₹${order.total_amount}
- Status: ${order.status}
- Payment: ${order.payment_status} (${order.payment_method})
${order.tracking_id ? `- Tracking: ${order.shipping_carrier || 'Courier'} - ${order.tracking_id}` : ''}
`;
            });
        } else {
            userContext += `\n- No order history found for this number.\n`;
        }

        console.log("[Context] Rich user context built");


        // 2. Fetch Conversation History (Last 10 messages for context)
        const { data: conversationHistory } = await supabase
            .from('whatsapp_conversations')
            .select('role, message, created_at')
            .eq('phone_number', sender)
            .order('created_at', { ascending: false })
            .limit(10);

        // Reverse to get chronological order (oldest first)
        const history = conversationHistory ? conversationHistory.reverse().map(msg => ({
            role: msg.role, // 'user' or 'model'
            parts: [{ text: msg.message }]
        })) : [];

        console.log(`[Context] Loaded ${history.length} messages from conversation history`);

        // 3. Generate Response
        const response = await AuraService.generateResponse(messageText, history, userContext);

        // 4. Save User Message to History
        await supabase.from('whatsapp_conversations').insert({
            phone_number: sender,
            role: 'user',
            message: messageText,
            created_at: new Date().toISOString()
        });

        // 5. Send Reply
        if (response.text) {
            await WhatsAppService.sendMessage(sender, response.text);

            // 6. Save AI Response to History
            await supabase.from('whatsapp_conversations').insert({
                phone_number: sender,
                role: 'model',
                message: response.text,
                created_at: new Date().toISOString()
            });
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
