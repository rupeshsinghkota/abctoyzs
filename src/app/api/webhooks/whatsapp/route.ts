
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

        // --- ROBUST PARSING FOR STRINGIFIED MESSAGES (MSG91 style) ---
        let internalMessages = payload.messages;
        if (typeof internalMessages === 'string') {
            try {
                internalMessages = JSON.parse(internalMessages);
            } catch (e) {
                console.warn("Failed to parse stringified messages array");
            }
        }
        const firstMessage = Array.isArray(internalMessages) ? internalMessages[0] : null;

        // AbcToyz Number: 918239269217
        const TARGET_NUMBER = "918239269217";

        // 1. EXTRACT UNIQUE ID AND STATUS EARLY
        // Meta uses 'statuses' for delivery updates, MSG91 might use different fields
        const statusUpdate = payload.statuses?.[0] || body.statuses?.[0] || (body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]);
        const wamid = statusUpdate?.id || payload.wamid || payload.uuid || payload.message_uuid || payload.id ||
            firstMessage?.id;

        // --- HANDLE STATUS UPDATES (Manual Replies / Delivery Status) ---
        if (statusUpdate && (statusUpdate.status === 'sent' || statusUpdate.status === 'delivered' || statusUpdate.status === 'read')) {
            if (statusUpdate.status === 'sent') {
                // Grace period to allow AI insert to complete
                await new Promise(resolve => setTimeout(resolve, 500));

                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
                const supabase = await import("@supabase/supabase-js").then(m => m.createClient(supabaseUrl, supabaseKey));

                const { data: existingMsg } = await supabase
                    .from('whatsapp_conversations')
                    .select('id')
                    .contains('metadata', { message_id: wamid })
                    .maybeSingle();

                if (!existingMsg) {
                    console.log(`[WhatsApp] 🚀 Manual Admin Reply Detected via Status! WAMID: ${wamid}`);
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
                }
            }
            return NextResponse.json({ status: "success", reason: "status_update_processed" });
        }

        // 2. EXTRACT MESSAGE TEXT AND PHONE
        let customerPhone = payload.customerNumber || payload.recipient_number || payload.to || payload.from ||
            payload.recipient || payload.destination || payload.mobile || payload.customerNumber || payload.number ||
            firstMessage?.from || "";

        const messageText = payload.text || payload.message || payload.body || payload.caption ||
            firstMessage?.text?.body || "";

        const cleanPhone = customerPhone.replace(/\D/g, "");
        if (!cleanPhone || cleanPhone === "DEBUG") {
            return NextResponse.json({ status: "ignored", reason: "invalid_phone" });
        }

        // --- RAW DEBUG LOG (Delayed until phone is known) ---
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const supabase = await import("@supabase/supabase-js").then(m => m.createClient(supabaseUrl, supabaseKey));

        await supabase.from('whatsapp_conversations').insert({
            phone_number: 'DEBUG',
            role: 'user',
            message: `RAW_PAYLOAD: ${JSON.stringify(body)}`,
            metadata: wamid ? { incoming_wamid: wamid, phone: cleanPhone } : undefined,
            created_at: new Date().toISOString()
        });

        // 3. DEDUPLICATION
        if (wamid) {
            const { data: alreadyProcessed } = await supabase
                .from('whatsapp_conversations')
                .select('id')
                .contains('metadata', { message_id: wamid })
                .maybeSingle();

            if (alreadyProcessed) {
                console.log(`[WhatsApp] 🛑 Duplicate Hit Ignored. WAMID: ${wamid}`);
                return NextResponse.json({ status: "ignored", reason: "duplicate_hit" });
            }

            // Also check for user messages with this wamid to avoid double logging
            const { data: userMsgExists } = await supabase
                .from('whatsapp_conversations')
                .select('id')
                .eq('role', 'user')
                .contains('metadata', { message_id: wamid })
                .maybeSingle();

            if (userMsgExists) {
                console.log(`[WhatsApp] 🛑 User message already logged. WAMID: ${wamid}`);
                return NextResponse.json({ status: "ignored", reason: "user_message_already_logged" });
            }
        }

        // 4. DETECT DIRECTION
        const directionValue = payload.direction;
        const isDirectionOutbound = directionValue === 1 || directionValue === '1' || directionValue === 'outbound' || payload.direction_id === 1;

        const isSentByMe = isDirectionOutbound || payload.event === 'sent' || payload.type === 'sent' || payload.status === 'sent' ||
            payload.direction === 'outbound' || payload.action === 'sent' || payload.direction === 'out' ||
            payload.event_type === 'sent' || payload.event === 'outbound-message-status' ||
            (cleanPhone === TARGET_NUMBER);

        if (isSentByMe) {
            console.log(`[WhatsApp] 👩‍💼 Outbound message from ${cleanPhone}. Logging as Admin.`);
            const targetRecipient = (payload.to || payload.recipient_number || payload.recipient)?.replace(/\D/g, "");
            await supabase.from('whatsapp_conversations').insert({
                phone_number: cleanPhone === TARGET_NUMBER ? targetRecipient : cleanPhone,
                role: 'model',
                message: `(ADMIN) ${messageText || '[Media/Template]'}`,
                metadata: wamid ? { message_id: wamid } : undefined,
                created_at: new Date().toISOString()
            });
            return NextResponse.json({ status: "success", reason: "admin_reply_logged" });
        }

        // --- CHECK FOR EMPTY MESSAGES ---
        if (!messageText) {
            console.log("[WhatsApp] ⚠️ Empty message text, possibly unsupported content. Logging and ignoring AI reply.");
            await supabase.from('whatsapp_conversations').insert({
                phone_number: cleanPhone,
                role: 'user',
                message: '[Unsupported Content or Empty Message]',
                metadata: wamid ? { message_id: wamid } : undefined,
                created_at: new Date().toISOString()
            });
            return NextResponse.json({ status: "success", reason: "empty_message_logged" });
        }

        // 5. HUMAN TAKEOVER CHECK
        const { data: conversationHistory } = await supabase
            .from('whatsapp_conversations')
            .select('role, message, created_at')
            .eq('phone_number', cleanPhone)
            .order('created_at', { ascending: false })
            .limit(10);

        const latestAdminMessage = conversationHistory?.find(msg =>
            msg.role === 'admin' ||
            msg.role === 'model_handover' ||
            (msg.role === 'model' && msg.message?.startsWith('(ADMIN)'))
        );

        if (latestAdminMessage) {
            const messageDate = new Date(latestAdminMessage.created_at);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            if (messageDate > twentyFourHoursAgo) {
                console.log(`[WhatsApp] 👨‍💼 HUMAN TAKEOVER ACTIVE for ${cleanPhone}. AI silent.`);
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

        // 6. PROCEED TO AI RESPONSE
        // Log User Message
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

        // Build RICH context
        console.log(`[Context] Fetching orders for phone: ${cleanPhone}`);
        const phoneVariations = [
            cleanPhone,
            cleanPhone.substring(2),
            cleanPhone.substring(0, 2) + ' ' + cleanPhone.substring(2),
        ];

        let matchingAddresses = null;
        let customerName = null;
        for (const phonePattern of phoneVariations) {
            const { data } = await supabase
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
                .select(`id, status, payment_status, total_amount, created_at, tracking_id, shipping_carrier`)
                .in('shipping_address_id', addressIds)
                .order('created_at', { ascending: false })
                .limit(5);

            if (orders && orders.length > 0) {
                const orderIds = orders.map(o => o.id);
                const { data: allItems } = await supabase
                    .from('order_items')
                    .select('order_id, product_name, quantity')
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

        const history = (conversationHistory || []).reverse().map(msg => ({
            role: (msg.role === 'admin' || msg.role === 'model_handover' || (msg.role === 'model' && msg.message?.startsWith('(ADMIN)'))) ? 'model' : msg.role as "user" | "model",
            parts: [{ text: msg.message }]
        }));

        const response = await AuraService.generateResponse(messageText, history, userContext);

        if (response.text) {
            const sendResult = await WhatsAppService.sendMessage(cleanPhone, response.text);
            const sentMessageId = (sendResult as any)?.message_uuid || (sendResult as any)?.wamid || (sendResult as any)?.uuid;

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
