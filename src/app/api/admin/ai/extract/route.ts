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
               - GENERATE a premium, high-converting, LONG-FORM HTML marketing description (at least 300-400 words).
               - **WEAVE DETAILS:** You MUST weave all extracted technical details (Battery, Motor, Speed, Load, Tires, Seats) into the marketing narrative. Do not just list them; sell the benefits!
               - **STRUCTURE FOR BANNERS:** You MUST follow this exact structure for our automated banner injection system:
                 - **Hook & Intro:** Start with a bold <h2> header (e.g., "The Ultimate Adventure Awaits") followed by 2 rich paragraphs.
                 - **Banner 1 Anchor:** End the second paragraph with a clean transition. (DO NOT ADD A TAG, just a line break).
                 - **Feature Showcase:** A list of key features using <h3> and <ul>/<li>.
                 - **Safety & Quality Section:** Generate a section header exactly like this: "<h3>🛡️ Safety & Quality</h3>", followed by a detailed paragraph emphasizing engineering, material safety, and parental controls.
                 - **Banner 2 Anchor:** This section MUST be present for Banner 2 to be inserted.
                 - **Closing:** A final "Conclusion" paragraph with a strong Call to Action for parents.
               - **BRANDING:** Maintain strict "${BRAND_CONFIG.name}" presence.
               - **FORMATTING:** Use valid HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>).
               - **TONE:** ${BRAND_CONFIG.aiInstructions.tone}.

            3. **SEO DATA (CREATIVE Generation):**
               - **product_name:** Format as: "ABC Toyz Premium [Product Name]" (Replace [Product Name] with the actual model).
               - **meta_title:** Click-worthy title including "${BRAND_CONFIG.name}".
               - **meta_description:** Compelling summary mentioning "${BRAND_CONFIG.name}".

            4. **MAPPING RULES:**
               - **age_group:** Based on the suitable age, map explicitly to one of: "1-3", "3-6", "6-12", "10+". (REQUIRED FIELD).

            Output ONLY a JSON object with this exact schema:
            {
                "name": "ABC Toyz Premium [Product Name]",
                "price": "Price found (number only) or 0",
                "description": "<div class='prose'>...Long HTML content...</div>",
                "meta_title": "SEO Title | ${BRAND_CONFIG.name}",
                "meta_description": "SEO Description...",
                "category": "cars|bikes|jeeps|suv|atv|go-kart",
                "age_group": "1-3|3-6|6-12|10+",
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
