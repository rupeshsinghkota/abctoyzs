import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { productName, featureText, productNotes, originalImageUrl } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const supabase = await createClient();
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        });

        // Fetch Logo
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        // Fetch Product Image if provided
        let productBase64 = null;
        if (originalImageUrl) {
            const prodRes = await fetch(originalImageUrl);
            const prodBuffer = await prodRes.arrayBuffer();
            productBase64 = Buffer.from(prodBuffer).toString("base64");
        }

        const prompt = `
            ROLE: You are a Graphic Designer and Marketing Specialist for "${BRAND_CONFIG.name}".
            
            TASK: Create a HIGH-END "A+ CONTENT" MARKETING POSTER for the product: "${productName}".
            
            PRODUCT CONTEXT: ${productNotes || "A premium ride-on toy for children."}
            
            POSTER DIMENSIONS: 16:9 Landscape Wide Banner.
            
            CONTENT REQUIREMENTS:
            1. AUTHENTIC PRODUCT: Feature the vehicle prominently. Use the provided PRODUCT_IMAGE as the ONLY source for the car. The car's model, color, and features MUST remain 100% authentic and accurate to the photo.
            2. CLEANING: surgically remove any watermarks, generic shop logos, or retailer text from other sellers found in the original PRODUCT_IMAGE. DO NOT remove original car manufacturer logos (Jeep, Ford, etc.).
            3. BRANDING: Use the provided BRAND_LOGO asset. Place it in a corner or center so it looks like an official corporate banner.
            4. MARKETING TEXT: Incorporate a punchy, high-end marketing slogan. 
               - THEME: "${featureText}"
               - SPECIFICS: Use details from the PRODUCT CONTEXT (like specific battery voltage, motor power, or luxury features) to make it highly relevant.
            5. DIVERSE COMPOSITION: DO NOT use the same generic center-shot for every image. Create variety by using different cinematic photography angles (e.g., dynamic 3/4 hero shots, sleek low-angle side profiles, or high-angle lifestyle perspectives).
            6. BACKGROUND VARIETY: A lifestyle setting that matches the product's luxury level (e.g., modern architectural driveway, sunset mountain pass, or a high-tech studio). The car MUST look naturally integrated with perfect perspective and lighting.
            7. VISUALS: Sharp focus, 8k resolution, cinematic lighting, and professional color grading.
            
            Output ONLY the final 16:9 high-resolution marketing poster with a unique and powerful composition.
        `;

        const inputs = [prompt, { inlineData: { data: logoBase64, mimeType: "image/png" } }];
        if (productBase64) {
            inputs.push({ inlineData: { data: productBase64, mimeType: "image/jpeg" } });
        }

        const result = await model.generateContent(inputs);
        const response = await result.response;

        // Robust check for response candidates
        if (!response.candidates || response.candidates.length === 0) {
            // Check if it was blocked by safety filters
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                console.error("Poster Generation Blocked:", blockReason, response.promptFeedback);
                throw new Error(`Poster generation was blocked by safety filters: ${blockReason}. Please try different product notes.`);
            }

            console.error("Gemini Poster Error (No Candidates):", JSON.stringify(response, null, 2));
            throw new Error("The AI failed to generate the poster. Please try again or simplify the product context.");
        }

        const candidate = response.candidates[0];

        // Check for finish reason
        if (candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS" && !candidate.content?.parts?.[0]?.inlineData) {
            console.error("Poster Generation Stopped Prematurely:", candidate.finishReason, candidate.safetyRatings);
            throw new Error(`Poster generation stopped unexpectedly (${candidate.finishReason}). This is usually due to safety filters.`);
        }

        if (!candidate.content?.parts?.[0]?.inlineData) {
            console.error("Incomplete Poster Response:", JSON.stringify(candidate, null, 2));
            throw new Error("The AI returned a partial response without poster data. Please try again.");
        }

        const newImageBase64 = candidate.content.parts[0].inlineData.data;
        const newImageBuffer = Buffer.from(newImageBase64, 'base64');

        const filename = `poster_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filename, newImageBuffer, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filename);

        return NextResponse.json({ success: true, posterUrl: publicUrl });

    } catch (error: any) {
        console.error("Poster Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
