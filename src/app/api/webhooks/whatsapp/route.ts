
import { NextResponse } from "next/server";
import { AuraService } from "@/lib/services/aura";
import { WhatsAppService } from "@/lib/services/whatsapp"; // Correct import path
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const rawBody = await req.text();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = await import("@supabase/supabase-js").then(m => m.createClient(supabaseUrl, supabaseKey));

    try {
        console.log("Incoming WhatsApp Webhook Raw:", rawBody);

        let body: any = {};
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            const params = new URLSearchParams(rawBody);
            body = Object.fromEntries(params);
        }

        const payload = Array.isArray(body) ? body[0] : (body.entry?.[0]?.changes?.[0]?.value || body);

        // --- IMMEDIATE RAW DEBUG LOG ---
        await supabase.from('whatsapp_conversations').insert({
            phone_number: 'DEBUG',
            role: 'user',
            message: `RAW_PAYLOAD: ${rawBody}`,
            created_at: new Date().toISOString()
        });

        // --- ROBUST PARSING FOR STRINGIFIED MESSAGES ---
        let internalMessages = payload.messages;
        if (typeof internalMessages === 'string') {
            try { internalMessages = JSON.parse(internalMessages); } catch (e) { }
        }
        const firstMessage = Array.isArray(internalMessages) ? internalMessages[0] : null;

        const TARGET_NUMBER = "918239269217";

        // 1. EXTRACT UNIQUE ID AND STATUS EARLY
        const statusUpdate = payload.statuses?.[0] || body.statuses?.[0] || (body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]);
        const wamid = statusUpdate?.id || payload.wamid || payload.uuid || payload.message_uuid || payload.id || firstMessage?.id;

        // --- HANDLE STATUS UPDATES ---
        if (statusUpdate && (['sent', 'delivered', 'read'].includes(statusUpdate.status))) {
            if (statusUpdate.status === 'sent' && wamid) {
                await new Promise(r => setTimeout(r, 800)); // Grace period

                // Check if this message was already logged using WAMID prefix
                const { data: existingMsg } = await supabase
                    .from('whatsapp_conversations')
                    .select('id')
                    .ilike('message', `%[WAMID:${wamid}]%`)
                    .maybeSingle();

                if (!existingMsg) {
                    console.log(`[WhatsApp] 🚀 Manual Admin Reply Detected via Status! WAMID: ${wamid}`);
                    const recipientPhone = statusUpdate.recipient_id?.replace(/\D/g, "");
                    if (recipientPhone) {
                        await supabase.from('whatsapp_conversations').insert({
                            phone_number: recipientPhone,
                            role: 'model',
                            message: `(ADMIN) [WAMID:${wamid}] [Manual Admin Reply]`,
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

        const cleanPhone = customerPhone.replace(/\D/g, "");
        const integratedNum = (payload.integratedNumber || "").replace(/\D/g, "");

        if (!cleanPhone || cleanPhone === "DEBUG") {
            return NextResponse.json({ status: "ignored", reason: "invalid_phone" });
        }

        // --- MULTI-TENANT FILTER ---
        // If this hit is for a different business number (e.g. D2BCart 917557777987), ignore it.
        // Incoming hits have integratedNumber = TARGET. Outbound manual hits have customerNumber = TARGET.
        if (integratedNum && integratedNum !== TARGET_NUMBER && cleanPhone !== TARGET_NUMBER) {
            console.log(`[WhatsApp] 🛑 Ignoring hit for different business number: ${integratedNum}`);
            return NextResponse.json({ status: "ignored", reason: "wrong_business_number" });
        }

        let messageText = payload.text || payload.message || payload.body || payload.caption ||
            firstMessage?.text?.body || "";

        // 3. DEDUPLICATION
        if (wamid) {
            const { data: alreadyProcessed } = await supabase
                .from('whatsapp_conversations')
                .select('id')
                .ilike('message', `%[WAMID:${wamid}]%`)
                .maybeSingle();

            if (alreadyProcessed) {
                console.log(`[WhatsApp] 🛑 Duplicate Hit Ignored. WAMID: ${wamid}`);
                return NextResponse.json({ status: "ignored", reason: "duplicate_hit" });
            }
        }

        // 4. DETECT DIRECTION
        const isSentByMe = (cleanPhone === TARGET_NUMBER) ||
            payload.direction === 'outbound' ||
            payload.direction_id === 1 ||
            payload.event === 'sent';

        if (isSentByMe) {
            console.log(`[WhatsApp] 👩‍💼 Outbound message from ${cleanPhone}. Logging as Admin.`);
            const targetRecipient = (payload.to || payload.recipient_number || payload.recipient || payload.integratedNumber)?.replace(/\D/g, "");

            if (targetRecipient && targetRecipient !== TARGET_NUMBER) {
                await supabase.from('whatsapp_conversations').insert({
                    phone_number: targetRecipient,
                    role: 'model',
                    message: `(ADMIN) [WAMID:${wamid || 'N/A'}] ${messageText || '[Media/Template]'}`,
                    created_at: new Date().toISOString()
                });
            }
            return NextResponse.json({ status: "success", reason: "admin_reply_logged" });
        }

        // --- CHECK FOR EMPTY MESSAGES ---
        if (!messageText) {
            console.log("[WhatsApp] ⚠️ Empty message text, possibly unsupported content. Logging and ignoring AI reply.");
            await supabase.from('whatsapp_conversations').insert({
                phone_number: cleanPhone,
                role: 'user',
                message: `[WAMID:${wamid || 'N/A'}] [Unsupported Content or Empty Message]`,
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
            (msg.role === 'model' && (msg.message?.startsWith('(ADMIN)') || msg.message?.includes('[Manual Admin Reply]')))
        );

        if (latestAdminMessage) {
            const messageDate = new Date(latestAdminMessage.created_at);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            if (messageDate > twentyFourHoursAgo) {
                console.log(`[WhatsApp] 👨‍💼 HUMAN TAKEOVER ACTIVE for ${cleanPhone}. AI silent.`);
                await supabase.from('whatsapp_conversations').insert({
                    phone_number: cleanPhone,
                    role: 'user',
                    message: `[WAMID:${wamid || 'N/A'}] ${messageText}`,
                    created_at: new Date().toISOString()
                });
                return NextResponse.json({ status: "success", reason: "human_takeover_active" });
            }
        }

        // 6. PROCEED TO AI RESPONSE
        await supabase.from('whatsapp_conversations').insert({
            phone_number: cleanPhone,
            role: 'user',
            message: `[WAMID:${wamid || 'N/A'}] ${messageText}`,
            created_at: new Date().toISOString()
        });

        const { data: globalSettings } = await supabase.from('settings').select('ai_reply_enabled').single();
        if (globalSettings?.ai_reply_enabled === false) {
            return NextResponse.json({ status: "success", reason: "ai_disabled" });
        }

        // Rich Context
        const phoneVariations = [cleanPhone, cleanPhone.substring(2)];
        let customerName = null;
        let matchingAddresses = null;
        for (const phonePattern of phoneVariations) {
            const { data } = await supabase.from('addresses').select('id, name').ilike('phone', `%${phonePattern}%`);
            if (data?.length) { matchingAddresses = data; customerName = data[0].name; break; }
        }

        let userContext = `# USER CONTEXT\n- Customer Name: ${customerName || 'Customer'}\n- Phone: ${cleanPhone}\n`;
        if (matchingAddresses?.length) {
            const { data: orders } = await supabase.from('orders').select(`id, status, total_amount, created_at, tracking_id`).in('shipping_address_id', matchingAddresses.map(a => a.id)).order('created_at', { ascending: false }).limit(3);
            if (orders?.length) {
                userContext += `\n## RECENT ORDERS\n` + orders.map(o => `- Order #${o.id}: ${o.status}, Amount: ${o.total_amount}`).join('\n');
            }
        }

        const rawHistory = (conversationHistory || [])
            .filter(msg => msg.message && !msg.message.includes(`[WAMID:${wamid}]`)) // Exclude current hit
            .reverse()
            .map(msg => ({
                role: (msg.role === 'admin' || msg.role === 'model_handover' || (msg.role === 'model' && msg.message?.includes('(ADMIN)'))) ? 'model' : msg.role as 'user' | 'model',
                parts: [{ text: msg.message }]
            }));

        const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
        const history = firstUserIdx !== -1 ? rawHistory.slice(firstUserIdx) : [];

        const response = await AuraService.generateResponse(messageText, history, userContext);

        if (response.text) {
            const sendResult = await WhatsAppService.sendMessage(cleanPhone, response.text);
            const sentWamid = (sendResult as any)?.data?.message_uuid || (sendResult as any)?.message_uuid ||
                (sendResult as any)?.wamid || (sendResult as any)?.uuid || (sendResult as any)?.request_id;

            await supabase.from('whatsapp_conversations').insert({
                phone_number: cleanPhone,
                role: response.handover ? 'model_handover' : 'model',
                message: `[WAMID:${sentWamid || 'N/A'}] ${response.text}`,
                created_at: new Date().toISOString()
            });
        }

        return NextResponse.json({ status: "success" });

    } catch (error: any) {
        console.error("CRITICAL WEBHOOK ERROR:", error.message);
        try {
            await supabase.from('whatsapp_conversations').insert({
                phone_number: 'ERROR',
                role: 'user',
                message: `CRASH: ${error.message} \n Payload: ${rawBody.substring(0, 300)}`,
                created_at: new Date().toISOString()
            });
        } catch (inner) {
            console.error("FAILED TO LOG ERROR TO DB:", inner instanceof Error ? inner.message : String(inner));
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    return NextResponse.json({ status: "Webhook Active", timestamp: new Date().toISOString() });
}
