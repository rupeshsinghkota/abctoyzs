import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are an expert E-commerce Product Data Specialist for "${BRAND_CONFIG.name}".
            Your task is to analyze the provided RAW TEXT and output a JSON object.

            RAW TEXT:
            """${text}"""

            CRITICAL INSTRUCTIONS:

            1. **TECHNICAL SPECS (STRICT Extraction):** 
               - Extract ONLY what is explicitly present in the text for the 'specs' and 'logistics' fields.
               - If a spec is OFFICIALLY missing, return an EMPTY STRING "". Do NOT guess.
               - Standardize units (e.g., "12 volts" -> "12V").

            2. **PRODUCT DESCRIPTION (CREATIVE Generation):**
               - GENERATE a high-converting, LONG-FORM HTML marketing description.
               - If the raw text is short/messy, EXPAND it into a premium sales pitch.
               - **BRANDING:** strictly use "${BRAND_CONFIG.name}" as the seller/brand name. REMOVE any competitor names or original supplier branding.
               - **FORMATTING:** Use valid HTML tags:
                 - <h2> for main section headers (e.g., "Why Kids Love This", "Safety First")
                 - <p> for detailed paragraphs (write at least 2-3 rich paragraphs)
                 - <ul> and <li> for feature lists
                 - <strong> for emphasis
               - **TONE:** ${BRAND_CONFIG.aiInstructions.tone}.
               - **BANNERS:** The description should be structured to support image insertions between paragraphs (the frontend will handle the actual insertion, but write enough text to space them out).

            3. **SEO DATA (CREATIVE Generation):**
               - **meta_title:** Generate a click-worthy title (max 60 chars) including "${BRAND_CONFIG.name}".
               - **meta_description:** Generate a compelling summary (max 160 chars) mentioning "${BRAND_CONFIG.name}".

            Output ONLY a JSON object with this exact schema:
            {
                "name": "Clean Product Name (Title Case)",
                "price": "Price found (number only) or 0",
                "description": "<div class='prose'>...Long HTML content...</div>",
                "meta_title": "SEO Title | ${BRAND_CONFIG.name}",
                "meta_description": "SEO Description...",
                "category": "cars|bikes|jeeps|suv|atv|go-kart",
                "specs": {
                    "battery": "e.g. 12V 7Ah",
                    "motor": "e.g. 2 x 35W",
                    "speed": "e.g. 3-5 km/h",
                    "max_load": "e.g. 30 kg",
                    "seats": "Number only (e.g. 1)",
                    "tire_type": "e.g. EVA Rubber",
                    "seat_material": "e.g. Leather",
                    "remote_control": "true/false (boolean)",
                    "mobile_app": "true/false (boolean)",
                    "suitable_age": "e.g. 2-6 Years",
                    "charging_time": "e.g. 8-10 Hours",
                    "run_time": "e.g. 45-60 Mins"
                },
                "logistics": {
                    "dimensions": "e.g. 110 x 50 x 50 cm",
                    "weight": "e.g. 15 kg",
                    "box_content": ["Item 1", "Item 2"]
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
