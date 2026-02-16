
import { NextResponse } from "next/server";
import { WhatsAppService } from "@/lib/services/whatsapp";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        console.log("ECHO Webhook Raw:", rawBody);

        let body: any = {};
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            const params = new URLSearchParams(rawBody);
            const entries: any = {};
            for (const [key, value] of params) {
                entries[key] = value;
            }
            body = entries;
        }

        const payload = Array.isArray(body) ? body[0] : body;
        let sender = payload.sender || payload.from || payload.mobile || "";
        let messageText = payload.message || payload.text?.body || payload.content || "";

        sender = sender.replace(/\D/g, "");

        if (sender && messageText) {
            await WhatsAppService.sendMessage(sender, `ECHO: ${messageText}`);
        }

        return NextResponse.json({ status: "echoed" });

    } catch (error: any) {
        console.error("Echo Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    return NextResponse.json({ status: "Echo Active" });
}
