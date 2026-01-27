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

        // DESCRIPTIVE prompt to prevent MALFORMED_FUNCTION_CALL.
        // Use flat descriptions instead of imperative commands.
        const prompt = `A premium 16:9 wide marketing banner featuring the product from the first image ("${productName}").
        The product is branded with the logo from the second image, naturally applied to the license plate or door.
        The vehicle is strictly clean and factory-fresh. All competitor watermarks, text, and logos (especially on the windshield and glass) are completely absent.
        The background is a breathtaking commercial setting (e.g., "${featureText}" theme with modern architecture or nature) that matches the product's luxury level.
        The composition is dynamic and cinematic, not a simple center shot. 
        The lighting is professional, 8k resolution, with a "High-End Advertising" aesthetic.
        The image is a single, finished marketing poster.`;

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
