import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { text, posters = [], imageUrls = [] } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const parts: any[] = [];

        // 1. Add Text Context
        let promptText = `
            You are a world-class E-commerce Content Strategist for "${BRAND_CONFIG.name}".
            Your task is to analyze the provided INPUT (Images + Text) and output a premium Product Suite in JSON format.
        `;

        if (text && text.trim().length > 0) {
            promptText += `\nRAW TEXT NOTES:\n"""${text}"""\n`;
        }

        if (posters.length > 0) {
            promptText += `\nAVAILABLE MARKETING POSTERS (Use these URLs in the description):\n${posters.map((url: string, i: number) => `Poster ${i + 1}: ${url}`).join('\n')}\n`;
        }

        promptText += `
            CRITICAL CONTENT GUIDELINES:

            1. **VISUAL ANALYSIS (FROM IMAGES):**
               - Analyze the provided product images deeply.
               - EXTRACT all visual details: Color, Seat Material (Leather?), Tire Type (Rubber/EVA?), Rims, Lights, Dashboard features.
               - **PRESERVE THESE DETAILS EXACTLY** in the description. Do not hallucinate features not visible or mentioned.
               - **TEXT ANALYSIS:** If the image contains text overlays describing FEATURES (e.g., "12V", "Soft Start", "2 Motors"), **EXTRACT and USE them**.
               - **IGNORE SPAM:** Do NOT mention seller names, phone numbers, or "Sold by" watermarks.
               - **INVENT A SCENE:** For the marketing narrative, YOU decide the best setting/vibe (e.g., "Parkway Drive", "Formula 1 Track", "Luxury Estate") based on the car's look. Write the description as if the car is in that scene.

            2. **PREMIUM DESCRIPTION (CINEMATIC & PERSUASIVE):**
               - GENERATE a high-end, cinematic HTML marketing description (450-600 words).
               - **VOCABULARY:** Use "Automotive Excellence" and "Luxury Heritage" terminology.
               - **STRUCTURE:**
                 - <h2> immersive headline.
                 - [Section 1: Intro Storytelling] Set the scene you invented.
                 - [Poster 1 Injection]
                 - [Section 2: Performance & Tech] <h3> headers.
                 - [Poster 2 Injection]
                 - [Section 3: Luxury & Comfort] <h3> headers.
                 - [Poster 3 Injection (if available)]
                 - "<h3>🛡️ Safety & Quality</h3>" engineering deep-dive.
                 - "<h3>Conclusion</h3>" high-conversion closer.
               - **TONE:** ${BRAND_CONFIG.aiInstructions.tone}.
               - **FORMATTING:** Use **ONLY** valid HTML. Use <strong> tags for bold text.

            3. **BRAND INTEGRITY & SCRUBBING (MANDATORY):**
               - **ONLY AUTHORIZED BRAND:** The only brand name allowed to appear is "${BRAND_CONFIG.name}". 
               - **SCRUB EXTERNAL BRANDS:** If the raw text mentions any other brands, retailers, or competitors, REMOVE or REPLACE them with "${BRAND_CONFIG.name}".
               - **NAMING CONVENTION:** Always refer to the product as "${BRAND_CONFIG.name} Premium [Model Name]".

            4. **SEO DATA:**
               - **product_name:** "GENERATE A SPECIFIC, COMMERCIAL NAME based on image analysis."
                  - Format: "${BRAND_CONFIG.name} [Real Model Name if identifiable] [Voltage] [Key Feature] [Body Type]"
                  - Example: "${BRAND_CONFIG.name} Ferrari F8 Tributo Style 12V Drift Sports Car"
                  - Example: "${BRAND_CONFIG.name} Maverick 4x4 24V Off-Road Buggy"
                  - **MUST INCLUDE:** Voltage (if visible), Motor count (if visible), Licensing (if logo visible).
                  - **DO NOT USE:** Generic terms like "Premium Car" or just "Ride-on". Be specific!
               - **meta_title:** Premium SEO Title (55-60 chars).
               - **meta_description:** High-conversion meta description (155-160 chars).

            5. **MAPPING:**
               - **age_group:** Map strictly to: "1-3", "3-6", "6-10", or "10-plus".

            6. **MARKETING SUITE:**
               - Generate 3 punchy, high-end headlines (under 5 words each).

            Output ONLY valid JSON:
            {
                "name": "...",
                "price": 0,
                "description": "<div class='prose premium-prose'>...</div>",
                "meta_title": "...",
                "meta_description": "...",
                "category": "cars|bikes|jeeps|atvs|utvs|gokarts",
                "age_group": "...",
                "marketing_suite": { "action": "...", "comfort": "...", "durability": "..." },
                "specs": {
                    "battery": "...", "motor": "...", "speed": "...", "max_load": "...", "seats": "...",
                    "tire_type": "...", "seat_material": "...", "remote_control": true|false,
                    "mobile_app": true|false, "suitable_age": "...", "charging_time": "...", "run_time": "..."
                },
                "logistics": { "dimensions": "...", "weight": "...", "box_content": ["...", "..."] }
            }
        `;

        parts.push(promptText);

        // 2. Fetch and Add Images
        if (imageUrls && imageUrls.length > 0) {
            console.log(`[AI Extract] Fetching ${imageUrls.length} images for analysis...`);
            const validImageParts = await Promise.all(imageUrls.map(async (url: string) => {
                try {
                    const resp = await fetch(url);
                    if (!resp.ok) return null;
                    const buffer = await resp.arrayBuffer();
                    return {
                        inlineData: {
                            data: Buffer.from(buffer).toString("base64"),
                            mimeType: "image/jpeg"
                        }
                    };
                } catch (e) {
                    console.error(`Failed to fetch image ${url}`, e);
                    return null;
                }
            }));

            parts.push(...validImageParts.filter(p => p !== null));
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        let outputText = response.text();

        // Clean markdown if present
        outputText = outputText.replace(/```json|```/g, '').trim();

        // Parse JSON
        let data;
        try {
            data = JSON.parse(outputText);
        } catch (e) {
            console.error("JSON Parse Error:", outputText);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

        return NextResponse.json({ data });

    } catch (error: any) {
        console.error("AI Extraction Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
