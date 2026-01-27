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

        if (type === 'description') {
            prompt = `
                You are the Editor-in-Chief of a luxury parenting magazine.
                Write a LONG-FORM, immersive editorial review for: "${productName}" (${category}).
                ${contextString}
                ${brandingGuide}
                ${bannerInstruction}

                FORMAT: Output ONLY valid semantic HTML.
                
                Structure:
                1. <h3>[Magnetic Headline]</h3>
                [Insert img if available]
                2. <blockquote>[Emotional Hook]</blockquote>
                3. <p><strong>The Design:</strong> [Rich details...]</p>
                [Insert img if available]
                4. <h3>🏁 Performance</h3> <p>[...</p>
                5. <h3>✨ Features</h3> <ul>...</ul>
                
                Output ONLY the HTML string.
            `;
        } else if (type === 'specs') {
            // ... existing specs prompt
            prompt = `
                Act as a Technical Product Engineer.
                Extract or ESTIMATE realistic technical specifications for: "${productName}" (${category}).
                ${contextString}

                CRITICAL RULES:
                1. NEVER output "N/A", "Unknown", or "Variable".
                2. If exact data is missing, YOU MUST ESTIMATE based on similar products in this category (e.g. Most jeeps are 12V, 30kg load).
                3. Keep values SHORT and CONCISE (Max 3-5 words).
                
                Output ONLY a JSON object with these exact keys:
                {
                    "Battery": "e.g. 12V 7Ah (Rechargeable)",
                    "Motors": "e.g. 2 x 35W High Torque",
                    "Speed": "e.g. 3-7 km/h",
                    "Charging Time": "e.g. 8-10 Hours",
                    "Play Time": "e.g. 45-60 Mins",
                    "Max Load": "e.g. 35-40 kg",
                    "Suitable Age": "e.g. 2-6 Years",
                    "Seating Capacity": "e.g. 1 Seater or 2 Seater"
                }
            `;
        } else if (type === 'logistics') {
            // ... existing logistics prompt
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
                You are a "Master Product Specialist" for "${BRAND_CONFIG.name}".
                
                RAW PRODUCT DATA: "${notes}"
                ${brandingGuide}
                ${bannerInstruction}

                Return ONLY a JSON object:
                {
                    "name": "Premium Product Name",
                    "description": "High-end HTML description. Use <h3> for major headings. Use <ul> for lists. EMBED THE IMAGES naturally within this string using <img src='...' class='w-full rounded-2xl shadow-lg my-8' />. The text should be long, descriptive, and formatted beautifully.",
                    "meta_title": "SEO Title",
                    "meta_description": "SEO Desc",
                    "specs": { 
                        "battery": "12V 7Ah (Estimate if missing)", 
                        "motor": "2 x 35W (Estimate if missing)", 
                        "speed": "3-7 km/h", 
                        "max_load": "35 kg", 
                        "tire_type": "EVA Rubber or Plastic", 
                        "seats": "1 Seater or 2 Seater", 
                        "mobile_app": true, 
                        "remote_control": true 
                    },
                    "logistics": { "whats_in_the_box": [], "product_dimensions": "", "gross_weight": "" }
                }

                RULES FOR SPECS:
                - NEVER use "N/A" or "Unknown". Estimate realistic values.
                - Keep strings SHORT (under 5 words).
            `;
        }

        const result = await model.generateContent(prompt);
        // ... rest of file
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
