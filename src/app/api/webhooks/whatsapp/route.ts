
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
        const payload = Array.isArray(body) ? body[0] : (body.entry?.[0]?.changes?.[0]?.value || body);

        // --- RAW DEBUG LOG ---
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const supabase = await import("@supabase/supabase-js").then(m => m.createClient(supabaseUrl, supabaseKey));

        await supabase.from('whatsapp_conversations').insert({
            phone_number: 'DEBUG',
            role: 'user',
            message: `RAW_PAYLOAD: ${JSON.stringify(body)}`,
            created_at: new Date().toISOString()
        });

        // AbcToyz Number: 918239269217
        const TARGET_NUMBER = "8239269217";

        // 1. EXTRACT UNIQUE ID AND STATUS EARLY
        const statusUpdate = body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
        const wamid = statusUpdate?.id || payload.wamid || payload.uuid || payload.message_uuid || payload.id ||
            body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id;

        // --- HANDLE STATUS UPDATES (Manual Replies / Delivery Status) ---
        if (statusUpdate && statusUpdate.status === 'sent') {
            console.log("[WhatsApp] 🟢 Status Update Detected:", JSON.stringify(statusUpdate));

            // Check if this message was already sent by AI
            const { data: existingMsg } = await supabase
                .from('whatsapp_conversations')
                .select('id')
                .contains('metadata', { message_id: wamid })
                .single();

            if (!existingMsg) {
                // UNKNOWN message ID -> Manual Reply from Admin via Phone/App
                console.log(`[WhatsApp] 🚀 Manual Admin Reply Detected! WAMID: ${wamid}`);
                const recipientPhone = statusUpdate.recipient_id?.replace(/\D/g, "");

                if (recipientPhone) {
                    await supabase.from('whatsapp_conversations').insert({
                        phone_number: recipientPhone,
                        role: 'model',
                        message: `(ADMIN) [Manual Admin Reply]`,
                        metadata: { message_id: wamid },
                        created_at: new Date().toISOString()
                    });
                }
                return NextResponse.json({ status: "success", reason: "manual_reply_logged" });
            } else {
                console.log(`[WhatsApp] 🤖 AI Reply Status Update (Sent). WAMID: ${wamid}`);
                return NextResponse.json({ status: "ignored", reason: "ai_status_update" });
            }
        }

        // Return early for other status updates (delivered/read) to prevent double processing
        if (statusUpdate) {
            return NextResponse.json({ status: "ignored", reason: "general_status_update" });
        }

        // 2. DETECT DIRECTION AND MESSAGE PARSING
        const directionValue = payload.direction;
        const isDirectionOutbound = directionValue === 1 || directionValue === '1' || directionValue === 'outbound' || payload.direction_id === 1;

        const isSentByMe = isDirectionOutbound || payload.event === 'sent' || payload.type === 'sent' || payload.status === 'sent' ||
            payload.direction === 'outbound' || payload.action === 'sent' || payload.direction === 'out' ||
            payload.event_type === 'sent' || payload.event === 'outbound-message-status' ||
            (payload.from === TARGET_NUMBER);

        let customerPhone = payload.recipient_number || payload.to || payload.recipient || payload.destination ||
            payload.mobile || payload.customerNumber || payload.number ||
            body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "";

        let sender = payload.sender || payload.from || payload.mobile || payload.customerNumber || payload.number ||
            body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "";

        let messageText = payload.message || payload.text?.body || payload.content || payload.text ||
            payload.body || payload.msg ||
            body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || "";

        const cleanSender = typeof sender === 'string' ? sender.replace(/\D/g, "") : "";
        const reallySentByMe = isSentByMe || (cleanSender && cleanSender.includes(TARGET_NUMBER));
        const effectivePhone = reallySentByMe ? customerPhone : sender;
        const cleanPhone = typeof effectivePhone === 'string' ? effectivePhone.replace(/\D/g, "") : "";

        if (!cleanPhone || (!messageText && !reallySentByMe)) {
            console.log("[WhatsApp] Ignored: Missing phone or message content.");
            return NextResponse.json({ status: "ignored", reason: "missing_fields" });
        }

        // 3. SECURE DEDUPLICATION VIA WAMID
        if (wamid) {
            const { data: alreadyProcessed } = await supabase
                .from('whatsapp_conversations')
                .select('id')
                .eq('phone_number', cleanPhone)
                .contains('metadata', { message_id: wamid })
                .limit(1);

            if (alreadyProcessed && alreadyProcessed.length > 0) {
                console.log(`[WhatsApp] DUPLICATE Detected via WAMID: ${wamid}`);
                return NextResponse.json({ status: "duplicate" });
            }
        }

        // --- MULTI-TENANT FILTER ---
        const receiver = body.receiver || body.integratedNumber || body.integrated_number ||
            payload.receiver || payload.integratedNumber || payload.integrated_number ||
            body.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number || "";
        const cleanReceiver = typeof receiver === 'string' ? receiver.replace(/\D/g, "") : "";

        if (cleanReceiver && !cleanReceiver.includes(TARGET_NUMBER)) {
            console.log(`[WhatsApp Webhook] 🛑 Ignoring message for ${receiver}. I am AbcToyz.`);
            return NextResponse.json({ status: "ignored", reason: "wrong_number" });
        }

        // --- HUMAN TAKEOVER / INBOUND LOGIC ---
        // 1. Log Inbound Admin Reply (directly sent as message if available)
        if (reallySentByMe && messageText) {
            console.log(`[WhatsApp] 📤 Logging OUTBOUND admin message for ${cleanPhone}`);
            await supabase.from('whatsapp_conversations').insert({
                phone_number: cleanPhone,
                role: 'model',
                message: `(ADMIN) ${messageText}`,
                metadata: wamid ? { message_id: wamid } : undefined,
                created_at: new Date().toISOString()
            });
            return NextResponse.json({ status: "success", reason: "admin_reply_logged" });
        }

        // 2. Fetch History for Context and Takeover Detection
        const { data: conversationHistory } = await supabase
            .from('whatsapp_conversations')
            .select('role, message, created_at')
            .eq('phone_number', cleanPhone)
            .order('created_at', { ascending: false })
            .limit(10);

        // HUMAN TAKEOVER CHECK
        const latestAdminMessage = conversationHistory?.find(msg =>
            msg.role === 'admin' ||
            msg.role === 'model_handover' ||
            (msg.role === 'model' && msg.message?.startsWith('(ADMIN)'))
        );

        if (latestAdminMessage) {
            const messageDate = new Date(latestAdminMessage.created_at);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 1000 * 60);

            if (messageDate > twentyFourHoursAgo) {
                console.log(`[WhatsApp] 👨‍💼 HUMAN TAKEOVER ACTIVE for ${cleanPhone}. AI silent.`);
                // Still log the customer's message
                await supabase.from('whatsapp_conversations').insert({
                    phone_number: cleanPhone,
                    role: 'user',
                    message: messageText,
                    metadata: wamid ? { message_id: wamid } : undefined,
                    created_at: new Date().toISOString()
                });
                return NextResponse.json({ status: "success", reason: "human_takeover_active" });
            }
        }

        // 3. PROCEED TO AI RESPONSE
        // Save User Message FIRST to prevent race conditions
        await supabase.from('whatsapp_conversations').insert({
            phone_number: cleanPhone,
            role: 'user',
            message: messageText,
            metadata: wamid ? { message_id: wamid } : undefined,
            created_at: new Date().toISOString()
        });

        // Fetch Toggle
        const { data: globalSettings } = await supabase.from('settings').select('ai_reply_enabled').single();
        if (globalSettings?.ai_reply_enabled === false) {
            return NextResponse.json({ status: "success", reason: "ai_disabled" });
        }

        // Build RICH context with full customer data
        console.log(`[Context] Fetching orders for phone: ${cleanPhone}`);
        const phoneVariations = [
            cleanPhone,
            cleanPhone.substring(2),
            cleanPhone.substring(0, 2) + ' ' + cleanPhone.substring(2),
        ];

        let matchingAddresses = null;
        let customerName = null;
        for (const phonePattern of phoneVariations) {
            const { data, error: addrError } = await supabase
                .from('addresses')
                .select('id, name')
                .ilike('phone', `%${phonePattern}%`);

            if (data && data.length > 0) {
                matchingAddresses = data;
                customerName = data[0].name;
                break;
            }
        }

        let recentOrders = null;
        if (matchingAddresses && matchingAddresses.length > 0) {
            const addressIds = matchingAddresses.map(a => a.id);
            const { data: orders } = await supabase
                .from('orders')
                .select(`id, status, payment_status, total_amount, created_at, tracking_id, shipping_carrier, payment_method, user_id`)
                .in('shipping_address_id', addressIds)
                .order('created_at', { ascending: false })
                .limit(5);

            if (orders && orders.length > 0) {
                const orderIds = orders.map(o => o.id);
                const { data: allItems } = await supabase
                    .from('order_items')
                    .select('order_id, product_name, quantity, price')
                    .in('order_id', orderIds);

                recentOrders = orders.map(order => ({
                    ...order,
                    items: allItems?.filter(item => item.order_id === order.id) || []
                }));
            }
        }

        let userContext = `# USER CONTEXT\n- Customer Name: ${customerName || 'Customer'}\n- Phone Number: ${cleanPhone}\n`;
        if (recentOrders && recentOrders.length > 0) {
            userContext += `\n## CUSTOMER ORDERS\n`;
            recentOrders.forEach((order: any) => {
                const itemsList = order.items.map((i: any) => `${i.quantity}x ${i.product_name}`).join(', ');
                userContext += `\n### Order #${order.id}\n- Status: ${order.status}\n- Items: ${itemsList}\n- Tracking: ${order.tracking_id || 'Pending'}\n`;
            });
        }

        const history = conversationHistory ? [...conversationHistory].reverse().map(msg => ({
            role: (msg.role === 'admin' || msg.role === 'model_handover' || (msg.role === 'model' && msg.message?.startsWith('(ADMIN)'))) ? 'model' : msg.role,
            parts: [{ text: msg.message }]
        })) : [];

        const response = await AuraService.generateResponse(messageText, history, userContext);

        if (response.text) {
            const sendResult = await WhatsAppService.sendMessage(cleanPhone, response.text);
            const sentMessageId = (sendResult as any)?.message_uuid || (sendResult as any)?.wamid;

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
