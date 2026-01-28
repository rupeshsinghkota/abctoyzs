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

            2. **PREMIUM DESCRIPTION (CREATIVE & DETAILED):**
               - GENERATE a high-end, premium HTML marketing description (450-600 words).
               - **DETAIL WEAVING:** You MUST weave technical details (Battery, Motors, Speed, Load, Tires, Seats) directly into the storytelling. Don't just list them; explain the exhilaration of the ride and the peace of mind for parents.
               - **POSTER INTEGRATION (VIP):** If posters are available:
                 - Natural Placement: Insert Poster 1 after a strong introductory <h2> and 2 paragraphs.
                 - Safety Placement: Insert Poster 2 immediately before the "🛡️ Safety & Quality" section.
                 - HTML Format: <div class="my-10 marketing-poster"><img src="POSTER_URL" alt="Premium Feature" class="rounded-3xl w-full shadow-2xl border-4 border-white/10" /></div>
               - **HTML STRUCTURE:**
                 - <h2> headline (Premium and Action-oriented).
                 - [Section 1: The Experience] 2-3 immersive paragraphs.
                 - [Poster 1 Injection]
                 - [Section 2: Performance & Luxury] <h3> headers with rich paragraphs about power, seats, and tires.
                 - "<h3>🛡️ Safety & Quality</h3>" followed by a detailed paragraph about engineering and safety.
                 - [Poster 2 Injection]
                 - "<h3>Conclusion</h3>" with a high-conversion call to action.
               - **TONE:** ${BRAND_CONFIG.aiInstructions.tone}.

            3. **SEO DATA:**
               - **product_name:** "ABC Toyz Premium [Model]" (e.g. "ABC Toyz Premium Lamborghini Aventador SVJ").
               - **meta_title:** Premium SEO Title (55-60 chars).
               - **meta_description:** High-conversion meta description (155-160 chars).

            4. **MAPPING:**
               - **age_group:** Map strictly to: "1-3", "3-6", "6-12", or "10+".

            Output ONLY valid JSON:
            {
                "name": "...",
                "price": 0,
                "description": "<div class='prose'>...</div>",
                "meta_title": "...",
                "meta_description": "...",
                "category": "cars|bikes|jeeps|atvs|utvs|gokarts",
                "age_group": "...",
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
