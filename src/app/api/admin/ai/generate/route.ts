import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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

        if (type === 'description') {
            prompt = `
                You are a world-class luxury toy copywriter for "ABC Toyz". 
                Write a compelling, sophisticated, and high-converting product description for a "${productName}" in the "${category}" category.
                ${contextString}

                Tone: Exciting, premium, and trustworthy. Use evocative language (e.g., "exhilarating", "meticulously crafted", "unmatched safety").
                
                Structure (Markdown):
                1. ## [Catchy, Punchy Title] - A magnetic heading.
                2. **The ABC Toyz Experience**: A 2-3 sentence emotional hook about the joy this toy brings and why ABC Toyz is the ultimate choice for quality and service.
                3. ## ✨ Premium Highlights: 
                   - Use bold keys (e.g., **Authentic Design:** Real LED lights...)
                   - Focus on 5-7 stand-out features.
                4. ## 🛡️ Safety & Reliability:
                   - Emphasize parent-tested safety features, slow-start technology, and durable build.
                5. ## 🎁 The Perfect Gift:
                   - A concluding sentence on why this is the best gift for a child.

                Do not use generic placeholders. Mention "ABC Toyz" naturally 2-3 times.
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
                You are a "Master Product Specialist" for ABC Toyz. Extract and enhance product data from raw notes into a premium listing format.
                
                RAW PRODUCT DATA/NOTES:
                "${notes}"
                
                Return ONLY a JSON object:
                {
                    "name": "Create a premium, descriptive title (e.g. 'Ultimate 4WD Adventure Jeep by ABC Toyz' instead of just 'Jeep')",
                    "description": "Write a 300-word, high-end Markdown description following the world-class copywriting structure: Title, Emotional Hook, Premium Highlights (bulleted), and Safety section. Emphasize the ABC Toyz quality promise.",
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
