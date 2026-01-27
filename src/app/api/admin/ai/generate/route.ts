import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { productName, category, type, notes } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        let prompt = "";
        const contextString = notes ? `\nADDTIONAL CONTEXT/NOTES FROM USER: "${notes}"\nHighly prioritize these details in your response.` : "";
        const brandingGuide = `
            Brand Name: ${BRAND_CONFIG.name}
            Voice: ${BRAND_CONFIG.voice}
            Key Values: ${BRAND_CONFIG.marketingPillars.join(", ")}
        `;

        if (type === 'description') {
            prompt = `
                You are the Editor-in-Chief of a luxury parenting magazine like "Vogue Bambini" or "Architectural Digest".
                Write a LONG-FORM, immersive, editorial-style product review for a premium toy: "${productName}" (Category: ${category}).
                ${contextString}

                ${brandingGuide}
                
                TONE: Sophisticated, emotive, authoritative, and aspirational. Use rich vocabulary (e.g., "impeccable", "unrivaled", "masterpiece").
                LENGTH: 400-600 words. Do not be brief. This is a feature story.

                Format: Output ONLY valid semantic HTML (no markdown, no \`\`\` wrappers).
                
                Structure Requirements (Strictly Follow):
                
                1. <h3>[Create a Magnetic, 3-Word Headline (e.g., "The Ultimate Drive")]</h3>
                
                2. <blockquote>
                   "A statement piece that redefines playtime luxe. The ${productName} isn't just a toy; it's a rite of passage."
                   </blockquote>
                
                3. <p><strong>The Design Philosophy:</strong> [Write 2 rich paragraphs about the aesthetics, lines, and visual appeal. Compare it to the real vehicle if applicable. Evoke the feeling of seeing it for the first time.]</p>
                
                4. <h3>🏁 Performance & Engineering</h3>
                   <p>[Deep dive into the specs but written as a driving experience. Talk about the "thrill of the ignition", the "smooth interaction of the suspension", and the "commanding power of the battery".]</p>
                
                5. <h3>✨ Curated Features</h3>
                   <ul>
                     <li><strong>The Cockpit:</strong> [Describe the interior, dashboard, and controls in detail]</li>
                     <li><strong>Safety First:</strong> [Describe safety features like remote control and belts as "Peace of Mind" systems]</li>
                     <li><strong>Entertainment:</strong> [Describe the media system/music as an "In-Car Entertainment Suite"]</li>
                   </ul>
                
                6. <p><strong>The Verdict:</strong> [Concluding paragraph summarizing why this is the must-have gift of the season. End with a strong call to action for the parent.]</p>

                CRITICAL rules:
                - Do NOT use generic phrases like "perfect for your child". Use "designed for the discerning young driver".
                - Mention "${BRAND_CONFIG.name}" naturally ${BRAND_CONFIG.aiInstructions.brandingFrequency}.
                - Ensure the HTML is perfectly nested and valid.
                - NO markdown code blocks. Just the raw HTML string.
            `;
        } else if (type === 'specs') {
            prompt = `
                Suggest realistic technical specifications for a "${productName}" in the "${category}" category.
                ${contextString}
                Output ONLY a JSON object with the following potential fields:
                {
                    "Battery": "e.g. 12V 7Ah",
                    "Motors": "e.g. 2 x 35W",
                    "Speed": "e.g. 3-5 km/h",
                    "Charging Time": "e.g. 8-12 hours",
                    "Play Time": "e.g. 1-2 hours",
                    "Max Load": "e.g. 30kg",
                    "Suitable Age": "e.g. 3-8 years"
                }
            `;
        } else if (type === 'logistics') {
            prompt = `
                Suggest logistics and "What's in the box" details for a "${productName}" in the "${category}" category.
                ${contextString}
                Output ONLY a JSON object with the following fields:
                {
                    "whats_in_the_box": ["Item 1", "Item 2", ...],
                    "dimensions": "e.g. 110 x 65 x 50 cm",
                    "weight": "e.g. 15kg"
                }
            `;
        } else if (type === 'all') {
            prompt = `
                You are a "Master Product Specialist" for "${BRAND_CONFIG.name}". Extract and enhance product data from raw notes into a premium listing format.
                
                RAW PRODUCT DATA/NOTES:
                "${notes}"
                
                ${brandingGuide}
                
                Return ONLY a JSON object:
                {
                    "name": "Create a premium, CONCISE product name (max 6-8 words).",
                    "description": "Write a high-end HTML description (using <h3>, <p>, <ul>, <li> tags). Follow the world-class structure: Title, Emotional Hook, Premium Highlights list, and Safety section. Use strong adjectives. Reinforce the brand identity of ${BRAND_CONFIG.name}.",
                    "meta_title": "SEO Optimized meta title (max 60 chars)",
                    "meta_description": "SEO Optimized meta description (max 160 chars)",
                    "specs": {
                        "battery": "Realistic value based on notes",
                        "motor": "Realistic motors (e.g. 4 x 45W for 4WD)",
                        "speed": "Standard range",
                        "max_load": "Realistic kg",
                        "tire_type": "EVA Rubber or Plastic",
                        "seats": "Number of seats",
                        "mobile_app": true/false,
                        "remote_control": true/false
                    },
                    "logistics": {
                        "whats_in_the_box": ["Charger", "Manual", "Remote", etc.],
                        "product_dimensions": "Standard dimensions",
                        "gross_weight": "Weight in kg"
                    }
                }
            `;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // If it's specs, logistics, or all, try to parse JSON from the markdown block
        if (type === 'specs' || type === 'logistics' || type === 'all') {
            try {
                // Remove markdown backticks if present
                const cleanText = text.replace(/```json|```/g, '').trim();
                const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return NextResponse.json({ data: JSON.parse(jsonMatch[0]) });
                }
            } catch (e) {
                console.error("Failed to parse AI JSON:", e);
            }
        }

        return NextResponse.json({ data: text });
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
