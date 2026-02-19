
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

        // --- RAW DEBUG LOG ---
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const supabase = await import("@supabase/supabase-js").then(m => m.createClient(supabaseUrl, supabaseKey));

        await supabase.from('whatsapp_conversations').insert({
            phone_number: 'DEBUG',
            role: 'user',
            message: `RAW_PAYLOAD: ${JSON.stringify(body).substring(0, 500)}`,
            created_at: new Date().toISOString()
        });

        // Detect if this is a "sent" event (outbound) or message event (inbound)
        // AbcToyz Number: 918239269217
        const TARGET_NUMBER = "8239269217";

        // MSG91 direction: 1 means outbound. direction: 0 means inbound.
        const directionValue = payload.direction;
        const isDirectionOutbound = directionValue === 1 || directionValue === '1' || directionValue === 'outbound' || payload.direction_id === 1;

        const isSentByMe = isDirectionOutbound || payload.event === 'sent' || payload.type === 'sent' || payload.status === 'sent' ||
            payload.direction === 'outbound' || payload.action === 'sent' || payload.direction === 'out' ||
            payload.event_type === 'sent' || payload.event === 'outbound-message-status';

        // 🛑 Broaden extraction: Try almost every possible field name
        let customerNumber = payload.recipient_number || payload.to || payload.recipient || payload.destination || payload.mobile || payload.customerNumber || payload.number || "";
        let sender = payload.sender || payload.from || payload.mobile || payload.customerNumber || payload.number || "";
        let messageText = payload.message || payload.text?.body || payload.content || payload.text || payload.body || payload.msg || "";

        // Normalize for comparison
        const cleanSender = typeof sender === 'string' ? sender.replace(/\D/g, "") : "";

        // REFINED DETECTION: If the SENDER is our business number, it's definitely sent by us
        // Also check if it's an outbound direction and has text (actual manual reply)
        const hasTextContent = typeof messageText === 'string' && messageText.trim().length > 0;
        const reallySentByMe = isSentByMe || (cleanSender && cleanSender.includes(TARGET_NUMBER));

        // If it's sent by me, we care about the 'customerNumber' (recipient)
        const effectivePhone = reallySentByMe ? customerNumber : sender;

        console.log(`[WhatsApp Webhook DEBUG] Payload:`, JSON.stringify(body, null, 2));
        console.log(`[WhatsApp Webhook DEBUG] reallySentByMe: ${reallySentByMe}, effectivePhone: ${effectivePhone}`);

        if (!effectivePhone || !messageText) {
            console.log("[WhatsApp] Ignored: Missing phone or message.");
            // Log rejection reason for debugging
            await supabase.from('whatsapp_conversations').insert({
                phone_number: 'DEBUG',
                role: 'user',
                message: `REJECTED: Missing phone (${effectivePhone}) or message (${messageText})`,
                created_at: new Date().toISOString()
            });
            return NextResponse.json({ status: "ignored" });
        }

        // Normalize (remove non-digits)
        const cleanPhone = typeof effectivePhone === 'string' ? effectivePhone.replace(/\D/g, "") : "";

        console.log(`[WhatsApp] Processing ${reallySentByMe ? 'OUTBOUND' : 'INBOUND'} message for ${cleanPhone}: "${messageText}"`);

        // DEDUPLICATION: Check if we processed this exact message recently (within 2 minutes)
        // (supabase client already initialized)

        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        const { data: recentMessages } = await supabase
            .from('whatsapp_conversations')
            .select('message, created_at')
            .eq('phone_number', cleanPhone)
            .eq('role', isSentByMe ? 'admin' : 'user')
            .eq('message', messageText)
            .gte('created_at', twoMinutesAgo)
            .limit(1);

        if (recentMessages && recentMessages.length > 0) {
            console.log(`[WhatsApp] DUPLICATE detected: Same message already processed at ${recentMessages[0].created_at}`);
            return NextResponse.json({ status: "duplicate" });
        }

        // 🛑 MULTI-TENANT FILTER: Ignore messages NOT meant for AbcToyz
        // AbcToyz Number: 918239269217
        // (TARGET_NUMBER defined above)
        // If receiver IS present (inbound), it must be us. 
        // If integrated_number IS present (outbound), it must be us.
        const receiver = body.receiver || body.integratedNumber || body.integrated_number ||
            payload.receiver || payload.integratedNumber || payload.integrated_number || "";
        const cleanReceiver = typeof receiver === 'string' ? receiver.replace(/\D/g, "") : "";

        console.log(`[WhatsApp Webhook] Receiver: ${receiver}, Clean: ${cleanReceiver}, Target: ${TARGET_NUMBER}`);

        if (cleanReceiver && !cleanReceiver.includes(TARGET_NUMBER)) {
            console.log(`[WhatsApp Webhook] 🛑 Ignoring message for ${receiver} (Clean: ${cleanReceiver}). I am AbcToyz.`);
            return NextResponse.json({ status: "ignored", reason: "wrong_number" });
        }

        // 1. Build Context (Customer Info + Orders)
        // (Supabase client already initialized above for deduplication)

        // Check if a user exists with this phone number (search in addresses linked to orders)
        console.log(`[Context] Fetching orders for phone: ${cleanPhone}`);

        // Try multiple phone number variations for better matching
        const phoneVariations = [
            cleanPhone,                                    // 918239269217
            cleanPhone.substring(2),                       // 8239269217 (without 91)
            cleanPhone.substring(0, 2) + ' ' + cleanPhone.substring(2), // 91 8239269217
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
            console.log(`[Context] Found ${recentOrders?.length || 0} orders for ${cleanPhone}`);
        }

        // Build RICH context with full customer data
        let userContext = `
# USER CONTEXT
- Customer Name: ${customerName || 'Customer'}
- Phone Number: ${cleanPhone}
- Authentication: WhatsApp User (Mobile Verified)
`;

        if (recentOrders && recentOrders.length > 0) {
            userContext += `\n## CUSTOMER ORDERS (Full Details)\n`;
            userContext += `**IMPORTANT: These are the customer's Order IDs. Use them directly when customer asks about shipment/delivery.**\n\n`;

            recentOrders.forEach((order: any) => {
                const itemsList = order.items.map((i: any) => `${i.quantity}x ${i.product_name} (₹${i.price})`).join(', ');
                const deliveryInfo = order.tracking_id
                    ? `Tracking: ${order.shipping_carrier || 'Courier'} - ${order.tracking_id}`
                    : 'Tracking not yet assigned. Still in processing.';

                userContext += `
### Order #${order.id}
- **Order ID:** ${order.id} ← USE THIS ID
- Date: ${new Date(order.created_at).toLocaleDateString()}
- Items: ${itemsList || 'N/A'}
- Total: ₹${order.total_amount}
- Status: ${order.status}
- Payment: ${order.payment_status} (${order.payment_method})
- Delivery: ${deliveryInfo}
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
            .eq('phone_number', cleanPhone)
            .order('created_at', { ascending: false })
            .limit(10);

        console.log(`[WhatsApp Webhook DEBUG] History for ${cleanPhone}:`, JSON.stringify(conversationHistory));

        // --- HUMAN TAKEOVER DETECTION ---
        // 1. If this message is Sent By Admin (Outbound), log it and skip AI
        if (reallySentByMe && hasTextContent) {
            console.log(`[WhatsApp] 📤 Logging OUTBOUND message from admin for ${cleanPhone}`);
            // Use 'model' role to bypass DB constraint if 'admin' is not allowed, 
            // but add a prefix for detection logic.
            // Log message_id in metadata if available for context tracking
            const messageId = payload.wamid || payload.uuid || payload.message_uuid || payload.id;
            await supabase.from('whatsapp_conversations').insert({
                phone_number: cleanPhone,
                role: 'model', // Fallback role
                message: `(ADMIN) ${messageText}`,
                metadata: messageId ? { message_id: messageId } : undefined,
                created_at: new Date().toISOString()
            });
            return NextResponse.json({ status: "success", reason: "admin_reply_logged" });
        }

        // 1.B CONTEXT CHECK (REPLY TO UNKNOWN MESSAGE)
        // If the customer is replying to a message we don't have in our history,
        // it means a human sent that message from the dashboard/phone.
        const contextId = payload.context?.id || payload.reply_to_message_id ||
            payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.context?.id;

        if (!reallySentByMe && contextId) {
            const { data: knownMessage } = await supabase
                .from('whatsapp_conversations')
                .select('id')
                .contains('metadata', { message_id: contextId })
                .limit(1);

            if (!knownMessage || knownMessage.length === 0) {
                console.log(`[WhatsApp] 🛑 CONTEXT TAKEOVER: User replied to unknown msg ${contextId}. AI silence for ${cleanPhone}.`);
                await supabase.from('whatsapp_conversations').insert({
                    phone_number: cleanPhone,
                    role: 'model',
                    message: `(ADMIN) [Intervention Detected via Context Reply]`,
                    created_at: new Date().toISOString()
                });

                // Still log the customer's message
                await supabase.from('whatsapp_conversations').insert({
                    phone_number: cleanPhone,
                    role: 'user',
                    message: messageText,
                    created_at: new Date().toISOString()
                });
                return NextResponse.json({ status: "success", reason: "context_takeover" });
            }
        }

        // 2. Check if an admin has replied recently (last 24 hours)
        // We check for 'admin' role or 'model' role with '(ADMIN)' prefix
        const latestAdminMessage = conversationHistory?.find(msg =>
            msg.role === 'admin' ||
            msg.role === 'model_handover' ||
            (msg.role === 'model' && msg.message?.startsWith('(ADMIN)'))
        );

        if (latestAdminMessage) {
            const messageDate = new Date(latestAdminMessage.created_at);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 1000 * 60);

            if (messageDate > twentyFourHoursAgo) {
                console.log(`[WhatsApp] 👨‍💼 HUMAN TAKEOVER: Last reply was from an admin at ${latestAdminMessage.created_at}. AI staying silent for ${cleanPhone}.`);
                console.log(`[WhatsApp] Admin status: role=${latestAdminMessage.role}, message="${latestAdminMessage.message}"`);

                // Still log the incoming customer message
                await supabase.from('whatsapp_conversations').insert({
                    phone_number: cleanPhone,
                    role: 'user',
                    message: messageText,
                    created_at: new Date().toISOString()
                });

                return NextResponse.json({ status: "success", reason: "human_takeover" });
            }
        }

        // 3. Detect if THIS incoming webhook is a "sent" message (Sent by admin from phone)
        // (Handled above in step 1)

        // Reverse to get chronological order (oldest first) for AI context
        const history = conversationHistory ? conversationHistory.reverse().map(msg => ({
            role: (msg.role === 'admin' || msg.role === 'model_handover' || (msg.role === 'model' && msg.message?.startsWith('(ADMIN)'))) ? 'model' : msg.role,
            parts: [{ text: msg.message }]
        })) : [];

        console.log(`[Context] Loaded ${history.length} messages from conversation history`);

        // 3. Generate Response
        // Fetch AI reply toggle setting
        const { data: globalSettings } = await supabase
            .from('settings')
            .select('ai_reply_enabled')
            .single();

        const aiEnabled = globalSettings ? globalSettings.ai_reply_enabled !== false : true;

        if (!aiEnabled) {
            console.log("[WhatsApp] AI Reply disabled in settings. Skipping response.");

            // Still save the user message
            await supabase.from('whatsapp_conversations').insert({
                phone_number: cleanPhone,
                role: 'user',
                message: messageText,
                created_at: new Date().toISOString()
            });

            return NextResponse.json({ status: "success", reason: "ai_disabled" });
        }

        const response = await AuraService.generateResponse(messageText, history, userContext);

        // 4. Save User Message to History (If not already saved)
        await supabase.from('whatsapp_conversations').insert({
            phone_number: cleanPhone,
            role: 'user',
            message: messageText,
            created_at: new Date().toISOString()
        });

        // 5. Send Reply
        if (response.text) {
            const sendResult = await WhatsAppService.sendMessage(cleanPhone, response.text);
            const sentMessageId = (sendResult as any)?.message_uuid || (sendResult as any)?.wamid;

            // 6. Save AI Response to History
            await supabase.from('whatsapp_conversations').insert({
                phone_number: cleanPhone,
                role: response.handover ? 'model_handover' : 'model',
                message: response.text,
                metadata: sentMessageId ? { message_id: sentMessageId } : undefined,
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
