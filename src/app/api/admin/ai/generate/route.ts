import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { productName, category, type, notes, banners } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        let prompt = "";
        const contextString = notes ? `\nADDTIONAL CONTEXT/NOTES FROM USER: "${notes}"\nHighly prioritize these details in your response.` : "";

        let bannerInstruction = "";
        if (banners && Array.isArray(banners) && banners.length > 0) {
            bannerInstruction = `
                YOU HAVE ACCESS TO THE FOLLOWING MARKETING IMAGES (BANNERS):
                ${JSON.stringify(banners)}

                CRITICAL REQUIREMENT:
                You MUST embed these images directly into the HTML description using <img> tags.
                - Place them STRATEGICALLY between sections or paragraphs where they fit the narrative (e.g. one for design, one for performance).
                - Do NOT dump them all at once. Spread them out.
                - Use this exact class format: <img src="URL" alt="Feature highlight" class="w-full rounded-2xl shadow-lg my-8 border border-white/20" />
            `;
        }

        const brandingGuide = `
            Brand Name: ${BRAND_CONFIG.name}
            Voice: ${BRAND_CONFIG.voice}
            Key Values: ${BRAND_CONFIG.marketingPillars.join(", ")}

            CRITICAL PROHIBITION:
            - You must NEVER mention the brand "11cart" or any other retailer names.
            - ONLY refer to the brand as "${BRAND_CONFIG.name}".
            - If the input notes mention "11cart" or other brands, IGNORE them and replace with "${BRAND_CONFIG.name}".
        `;

        // ... (truncated for brevity, logic follows) ...

        if (type === 'description' || type === 'specs' || type === 'logistics' || type === 'all') {
            return NextResponse.json({ error: "Text generation is currently disabled." }, { status: 400 });
        }

        return NextResponse.json({ data: "Command not recognized" });
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
