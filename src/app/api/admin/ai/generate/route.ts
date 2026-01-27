import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { productName, category, type, notes } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "";
        const contextString = notes ? `\nADDTIONAL CONTEXT/NOTES FROM USER: "${notes}"\nHighly prioritize these details in your response.` : "";

        if (type === 'description') {
            prompt = `
                You are a premium ride-on toy marketing expert. 
                Write a high-converting, professional product description for a "${productName}" in the "${category}" category.
                ${contextString}
                Use Markdown formatting. Include:
                - A catchy opening paragraph.
                - A "Key Features" bulleted list.
                - A "Safety First" section because it's for kids.
                - Keep the tone exciting, playful, yet trustworthy.
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
                You are a product data expert. I will provide you with a raw text snippet or notes about a ride-on toy product.
                Your task is to extract and generate ALL relevant product details into a clean JSON format.
                
                RAW PRODUCT DATA/NOTES:
                "${notes}"
                
                Return ONLY a JSON object with this exact structure (if info is missing, suggest realistic values):
                {
                    "name": "Professional product name",
                    "description": "High-converting Markdown description",
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

        // If it's specs or logistics, try to parse JSON from the markdown block
        if (type === 'specs' || type === 'logistics') {
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    text = JSON.parse(jsonMatch[0]);
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
