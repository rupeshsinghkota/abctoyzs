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
                You are a premium ride-on toy marketing expert for the brand "ABC Toyz". 
                Write a high-converting, professional product description for a "${productName}" in the "${category}" category.
                ${contextString}
                Use Markdown formatting. Include:
                - A catchy opening paragraph that highlights why "ABC Toyz" is the best place for this ride-on.
                - A "Key Features" bulleted list.
                - A "Safety First" section because it's for kids.
                - Keep the tone exciting, playful, yet trustworthy.
                - Mention that this is an "ABC Toyz" premium selection.
                Do not include placeholders like [Price] or [Link].
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
                You are a product data expert for "ABC Toyz". I will provide you with a raw text snippet or notes about a ride-on toy product.
                Your task is to extract and generate ALL relevant product details into a clean JSON format, specifically branded for ABC Toyz.
                
                RAW PRODUCT DATA/NOTES:
                "${notes}"
                
                Return ONLY a JSON object with this exact structure (if info is missing, suggest realistic values):
                {
                    "name": "Professional product name (Include 'By ABC Toyz' or similar only if it enhances the brand)",
                    "description": "High-converting Markdown description emphasizing that this is a quality ABC Toyz product.",
                    "specs": {
                        "battery": "e.g. 12V 7Ah",
                        "motor": "e.g. 2 x 35W",
                        "speed": "e.g. 3-5 km/h",
                        "max_load": "e.g. 30kg",
                        "tire_type": "e.g. EVA Rubber",
                        "seats": "1 or 2",
                        "mobile_app": true/false,
                        "remote_control": true/false
                    },
                    "logistics": {
                        "whats_in_the_box": ["Charger", "Manual", etc.],
                        "product_dimensions": "L x W x H in cm",
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
