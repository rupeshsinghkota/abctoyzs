import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { text, posters = [] } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const posterContext = posters.length > 0
            ? `AVAILABLE MARKETING POSTERS (Use these URLs in the description):
${posters.map((url: string, i: number) => `Poster ${i + 1}: ${url}`).join('\n')}`
            : "No marketing posters provided.";

        const prompt = `
            You are a world-class E-commerce Content Strategist for "${BRAND_CONFIG.name}".
            Your task is to analyze the RAW TEXT and output a premium Product Suite in JSON format.

            RAW TEXT:
            """${text}"""

            ${posterContext}

            CRITICAL CONTENT GUIDELINES:

            1. **TECHNICAL SPECS (STRICT Extraction):** 
               - Extract ONLY what is explicitly present in the text.
               - If missing, return EMPTY STRING "". Standardize units (e.g., "12 volts" -> "12V").

            2. **PREMIUM DESCRIPTION (CINEMATIC & PERSUASIVE):**
               - GENERATE a high-end, cinematic HTML marketing description (450-600 words).
               - **VOCABULARY:** Use "Automotive Excellence" and "Luxury Heritage" terminology. Words like: *Sculpted lines, performance-tuned, authentic craftsmanship, exhilaration, command the pavement, legacy design, adventure-ready cockpit.*
               - **DETAIL WEAVING:** Weave technical specs (12V/24V power, dual/quad motors, leather-style seating) into the luxury narrative. Don't just list specs; describe the *feeling* of the power and the *quality* of the build.
               - **POSTER INTEGRATION:** If posters are available:
                 - Insert Poster 1 after a bold introductory <h2> and 2 paragraphs.
                 - Insert Poster 2 before the "🛡️ Safety & Quality" section.
                 - HTML Format: <div class="marketing-poster"><img src="URL" alt="Premium Perspective" /></div> (CSS handles spacing/shadows).
               - **STRUCTURE:**
                 - <h2> immersive headline (e.g., "The Legend Reimagined for Your Little Driver").
                 - [Section 1] 2-3 paragraphs of immersive storytelling.
                 - [Poster 1]
                 - [Section 2] Performance & Features with <h3> headers.
                 - "<h3>🛡️ Safety & Quality</h3>" followed by an engineering-focused paragraph.
                 - [Poster 2]
                 - "<h3>Conclusion</h3>" with a high-conversion closer.
               - **TONE:** ${BRAND_CONFIG.aiInstructions.tone}.
               - **FORMATTING:** Use **bold** liberally for impact. Use valid HTML.

            3. **SEO DATA:**
               - **product_name:** "ABC Toyz Premium [Model]" (e.g. "ABC Toyz Premium Lamborghini Aventador SVJ").
               - **meta_title:** Premium SEO Title (55-60 chars).
               - **meta_description:** High-conversion meta description (155-160 chars).

            4. **MAPPING:**
               - **age_group:** Map strictly to: "1-3", "3-6", "6-12", or "10+".

            5. **MARKETING SUITE:**
               - Generate 3 punchy, high-end headlines (under 5 words each) for marketing posters:
                 - **action:** Focus on speed/power (e.g., "Sculpted for Speed").
                 - **comfort:** Focus on interior/luxury (e.g., "Authentic Heritage Cockpit").
                 - **durability:** Focus on off-road/safety (e.g., "Conquer Any Terrain").

            Output ONLY valid JSON:
            {
                "name": "...",
                "price": 0,
                "description": "<div class='prose premium-prose'>...</div>",
                "meta_title": "...",
                "meta_description": "...",
                "category": "cars|bikes|jeeps|atvs|utvs|gokarts",
                "age_group": "...",
                "marketing_suite": {
                    "action": "...",
                    "comfort": "...",
                    "durability": "..."
                },
                "specs": {
                    "battery": "...", "motor": "...", "speed": "...", "max_load": "...", "seats": "...",
                    "tire_type": "...", "seat_material": "...", "remote_control": true|false,
                    "mobile_app": true|false, "suitable_age": "...", "charging_time": "...", "run_time": "..."
                },
                "logistics": {
                    "dimensions": "...", "weight": "...", "box_content": ["...", "..."]
                }
            }
        `;

        const result = await model.generateContent(prompt);
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
