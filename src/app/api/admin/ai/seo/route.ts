import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { segment, context } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const brandingGuide = `
            Brand Name: ${BRAND_CONFIG.name}
            Voice: ${BRAND_CONFIG.voice}
            Key Values: ${BRAND_CONFIG.marketingPillars.join(", ")}
            Tagline: ${BRAND_CONFIG.tagline}

            CRITICAL PROHIBITION:
            - You must NEVER mention the brand "11cart" or any other retailer names.
            - ONLY refer to the brand as "${BRAND_CONFIG.name}".
        `;

        let specificPrompt = "";

        if (segment === 'homepage') {
            specificPrompt = `
                Generate SEO metadata for the HOMEPAGE of ${BRAND_CONFIG.name}.
                The focus should be on brand authority, trust, and the wide range of premium products.
                Mention Pan-India delivery and fast shipping.
            `;
        } else if (segment.startsWith('cat_')) {
            const categoryName = segment.replace('cat_', '').charAt(0).toUpperCase() + segment.replace('cat_', '').slice(1);
            specificPrompt = `
                Generate SEO metadata for the ${categoryName} category page.
                Focus on the specific appeal of ${categoryName} ride-on vehicles (design, realism, safety).
            `;
        } else if (segment.startsWith('age_')) {
            const ageGroup = segment.replace('age_', '');
            specificPrompt = `
                Generate SEO metadata for children aged ${ageGroup} years.
                Focus on age-appropriate safety, developmental benefits, and the joy of riding at this stage.
            `;
        } else if (segment.startsWith('power_')) {
            const power = segment.replace('power_', '');
            specificPrompt = `
                Generate SEO metadata for ${power} powered ride-on vehicles.
                Focus on performance, battery life, speed options, and the thrill for older kids.
            `;
        } else {
            specificPrompt = `Generate optimized SEO metadata for a segment named "${segment}" of the website.`;
        }

        const prompt = `
            ${brandingGuide}
            
            ${specificPrompt}
            
            ${context ? `Additional user context: "${context}"` : ''}

            TASK:
            Return a JSON object with exactly two fields:
            1. "title": A compelling, keyword-rich SEO title (max 60 chars).
            2. "description": A persuasive meta description (max 160 chars).

            RULES:
            - Use exciting, premium adjectives.
            - Include a call to action if appropriate.
            - Do not include markdown formatting or backticks in the response, just the raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        try {
            // Attempt to clean any potential markdown formatting if Gemini adds it
            const cleanedResponse = responseText.replace(/```json|```/g, "").trim();
            const seoData = JSON.parse(cleanedResponse);
            return NextResponse.json(seoData);
        } catch (e) {
            console.error("Failed to parse AI response:", responseText);
            return NextResponse.json({
                title: `${BRAND_CONFIG.name} | Premium Ride-Ons`,
                description: `Discover the best collection of ride-on vehicles for kids at ${BRAND_CONFIG.name}.`
            });
        }
    } catch (error: any) {
        console.error("AI SEO Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
