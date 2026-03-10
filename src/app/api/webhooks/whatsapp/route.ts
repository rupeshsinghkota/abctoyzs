
import { NextResponse } from "next/server";
import { AuraService } from "@/lib/services/aura";
import { WhatsAppService } from "@/lib/services/whatsapp";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const rawBody = await req.text();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = await import("@supabase/supabase-js").then(m => m.createClient(supabaseUrl, supabaseKey));

    try {
        console.log("Incoming WhatsApp Webhook...");

        let body: any = {};
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            const params = new URLSearchParams(rawBody);
            body = Object.fromEntries(params);
        }

        const payload = Array.isArray(body) ? body[0] : (body.entry?.[0]?.changes?.[0]?.value || body);

        // --- ROBUST PARSING FOR STRINGIFIED MESSAGES ---
        let internalMessages = payload.messages;
        if (typeof internalMessages === 'string') {
            try { internalMessages = JSON.parse(internalMessages); } catch (e) { }
        }
        const firstMessage = Array.isArray(internalMessages) ? internalMessages[0] : null;

        const TARGET_NUMBER = process.env.MSG91_SENDER_NUMBER || process.env.MSG91_INTEGRATED_NUMBER || "917557777998";

        // 1. EXTRACT UNIQUE ID AND STATUS EARLY
        const statusUpdate = payload.statuses?.[0] || body.statuses?.[0] || (body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]);
        const wamid = statusUpdate?.id || payload.wamid || payload.uuid || payload.message_uuid || payload.id || firstMessage?.id;

        // --- HANDLE STATUS UPDATES ---
        if (statusUpdate && (['sent', 'delivered', 'read'].includes(statusUpdate.status))) {
            if (statusUpdate.status === 'sent' && wamid) {
                await new Promise(r => setTimeout(r, 800)); // Grace period
                const { data: existingMsg } = await supabase.from('whatsapp_conversations').select('id').ilike('message', `%[WAMID:${wamid}]%`).maybeSingle();
                if (!existingMsg) {
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
        if (integratedNum && integratedNum !== TARGET_NUMBER && cleanPhone !== TARGET_NUMBER) {
            return NextResponse.json({ status: "ignored", reason: "wrong_business_number" });
        }

        let messageText = payload.text || payload.message || payload.body || payload.caption ||
            firstMessage?.text?.body || "";

        // 3. DEDUPLICATION
        if (wamid) {
            const { data: alreadyProcessed } = await supabase.from('whatsapp_conversations').select('id').ilike('message', `%[WAMID:${wamid}]%`).maybeSingle();
            if (alreadyProcessed) {
                return NextResponse.json({ status: "ignored", reason: "duplicate_hit" });
            }
        }

        // 4. DETECT DIRECTION
        const isSentByMe = (cleanPhone === TARGET_NUMBER) ||
            payload.direction === 'outbound' ||
            payload.direction_id === 1 ||
            payload.event === 'sent';

        if (isSentByMe) {
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

        // --- PROCEED TO LOG USER MESSAGE EARLY ---
        await supabase.from('whatsapp_conversations').insert({
            phone_number: cleanPhone,
            role: 'user',
            message: `[WAMID:${wamid || 'N/A'}] ${messageText || '[Unsupported Content or Empty Message]'}`,
            created_at: new Date().toISOString()
        });

        // --- NEW: Capture as Lead ---
        try {
            // Take only last 10 digits for the lead table
            const leadPhone = cleanPhone.slice(-10);
            await supabase.from('leads').upsert({
                phone: leadPhone,
                source: 'whatsapp_incoming_chat',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'phone',
                ignoreDuplicates: false
            });
            console.log(`[WhatsApp] Lead captured/updated for ${leadPhone}`);
        } catch (leadError) {
            console.error("[WhatsApp] Lead capture error:", leadError);
        }

        // 5. RATE LIMITING (Max 6 messages in last 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count: recentMsgCount } = await supabase
            .from('whatsapp_conversations')
            .select('*', { count: 'exact', head: true })
            .eq('phone_number', cleanPhone)
            .eq('role', 'user')
            .gt('created_at', oneHourAgo);

        if ((recentMsgCount || 0) >= 6) {
            console.log(`[WhatsApp] 🛑 Rate Limit Triggered for ${cleanPhone}. (${recentMsgCount} msgs/hr)`);
            const { data: recentHandoff } = await supabase.from('whatsapp_conversations').select('id').eq('phone_number', cleanPhone).eq('role', 'model_handover').gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).maybeSingle();

            if (!recentHandoff) {
                const limitMessage = "I've received several messages from you. To ensure you get the best assistance, I've notified our team. Someone will contact you shortly! 😊";
                await supabase.from('whatsapp_conversations').insert({
                    phone_number: cleanPhone,
                    role: 'model_handover',
                    message: limitMessage,
                    created_at: new Date().toISOString()
                });
                await WhatsAppService.sendMessage(cleanPhone, limitMessage);
                await AuraService.generateResponse("SYSTEM_RATE_LIMIT_NOTICE", [], `# HANDOVER\nReason: Rate Limit Exceeded for ${cleanPhone}`);
            }
            return NextResponse.json({ status: "success", reason: "rate_limited" });
        }

        // 6. HUMAN TAKEOVER CHECK (Silences AI for 24h)
        const { data: conversationHistory } = await supabase.from('whatsapp_conversations').select('role, message, created_at').eq('phone_number', cleanPhone).order('created_at', { ascending: false }).limit(10);
        const latestAdminMessage = conversationHistory?.find(msg =>
            msg.role === 'admin' ||
            msg.role === 'model_handover' ||
            (msg.role === 'model' && (msg.message?.includes('(ADMIN)') || msg.message?.includes('[Manual Admin Reply]')))
        );

        if (latestAdminMessage) {
            const messageDate = new Date(latestAdminMessage.created_at);
            if (messageDate > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                console.log(`[WhatsApp] 👨‍💼 HUMAN TAKEOVER ACTIVE for ${cleanPhone}. AI silent.`);
                return NextResponse.json({ status: "success", reason: "human_takeover_active" });
            }
        }

        if (!messageText) {
            return NextResponse.json({ status: "success", reason: "empty_message_ignored" });
        }

        // 🚨 AI CHAT PERMANENTLY DISABLED FOR WHATSAPP (Aura Removal)
        return NextResponse.json({ status: "success", reason: "ai_chat_disabled_permanently" });

        // AI logic removed per request to completely disable Aura from WhatsApp
        /* 
           The previous logic for fetching user context, checking orders, 
           and calling AuraService for a response has been removed.
        */

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
        } catch (inner) { }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    return NextResponse.json({ status: "Webhook Active", timestamp: new Date().toISOString() });
}
