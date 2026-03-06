import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const {
            productId,
            productName,
            productDescription,
            count = 5,
            ratingRange = [4, 5],
            daysBack = 30,
            style = "mixed",
            year
        } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const stylesPrompt = {
            mixed: "A balanced mix of all styles below.",
            excited_parent: "Very emotional, focusing on the child's reaction, the joy of the gift, and how 'cute' the car looks. Uses lots of exclamation marks and emojis like 😍, ✨, 🏎️.",
            technical_buyer: "Focuses on build quality, battery life, assembly process, and motor power. Uses specific details and fewer exclamation marks. Mentions 'EVA tires', 'Remote control range', or 'Body finish'.",
            gift_focus: "Focuses on the unboxing experience, delivery speed, and the 'wow factor' for a birthday or special occasion. Mentions 'perfect gift', 'best surprise'.",
            honest_critique: "Sounds very authentic. May mention a minor point (like 'assembly took 30 mins' or 'wish it had more colors') but remains overwhelmingly positive (4-5 stars). Uses natural phrasing and occasional '...'."
        };

        const prompt = `
            You are an E-commerce Content Strategist specializing in building authentic social proof for "${BRAND_CONFIG.name}".
            Your task is to generate ${count} high-quality, realistic customer reviews that will WOW other parents.

            PRODUCT DETAILS:
            Name: ${productName}
            Description: ${productDescription}

            GENERATION STYLE:
            ${(stylesPrompt as any)[style] || stylesPrompt.mixed}

            CRITICAL GUIDELINES FOR "AWESOME" REVIEWS:
            1. **EMOTIONAL NARRATIVE**: Don't just say "Good product". Create a micro-story. (e.g., "Brought this for my son's 3rd birthday and his face lit up like a Christmas tree!")
            2. **FEATURE EXTRACTION**: Analyze the description and mention at least ONE specific feature correctly (e.g., "leather seats", "4WD power", "Bluetooth music").
            3. **REALISM & NUANCE**: 
               - Use diverse Indian names (e.g., Vikram, Sneha, Rahul, Anjali, Megha, Sanjay).
               - Use diverse Indian cities (e.g., Gurgaon, Hyderabad, Kolkata, Chandigarh, Jaipur).
               - Add emojis naturally but strategically (max 3 per review).
               - Occasionally include a very minor, realistic typo (e.g., "beutiful" instead of "beautiful") or a Hinglish word (e.g., "Shukriya", "Beta loved it", "Ekdum premium").
            ${year
                ? `4. **BACKDATING**: Dates must be ISO strings randomly spread across the ENTIRE year ${year} (from January to December).`
                : `4. **BACKDATING**: Dates must be ISO strings randomly spread across the last ${daysBack} days.`
            }
            5. **RATINGS**: Must be between ${ratingRange[0]} and ${ratingRange[1]} stars.

            Output ONLY valid JSON array of objects:
            [
                {
                    "customer_name": "...",
                    "rating": 5,
                    "comment": "...",
                    "location": "...",
                    "is_verified": true,
                    "is_approved": true,
                    "helpful_count": "random(2-15)",
                    "created_at": "ISO Date String"
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let outputText = response.text();

        // Clean markdown if present
        outputText = outputText.replace(/```json|```/g, '').trim();

        // Parse JSON
        let reviews;
        try {
            reviews = JSON.parse(outputText);
        } catch (e) {
            console.error("JSON Parse Error:", outputText);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

        // Add product_id to each review and ensure numbers are numbers
        const finalReviews = reviews.map((r: any) => ({
            ...r,
            product_id: productId,
            helpful_count: parseInt(r.helpful_count) || 0
        }));

        return NextResponse.json({ reviews: finalReviews });

    } catch (error: any) {
        console.error("AI Review Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
