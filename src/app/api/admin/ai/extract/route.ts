import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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
            You are a STRICT DATA PARSER.
            Your task is to extract structured product data from the provided RAW TEXT.

            RAW TEXT:
            """${text}"""

            CRITICAL RULES:
            1. EXTRACT ONLY what is explicitly present in the text.
            2. If a field is NOT found, return an EMPTY STRING "". Do NOT guess. Do NOT use "Unknown".
            3. Standardize units (e.g. convert "12 volts" to "12V", "3 to 5 km/h" to "3-5 km/h").
            4. For "category", try to map to one of: "cars", "bikes", "jeeps", "suv", "atv", "go-kart". If unsure, use "cars".

            Output ONLY a JSON object with this exact schema:
            {
                "name": "Product Name found in text",
                "price": "Price found (number only) or 0",
                "description": "A clean HTML description summarizing the text. Use <h3> for headers, <ul> for features.",
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
