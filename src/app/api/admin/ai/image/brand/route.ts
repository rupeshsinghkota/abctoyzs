import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { imageUrl, productName } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const supabase = await createClient();

        // Using the verified model for image generation with relaxed safety for commercial use
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        });

        // Step 1: Download original product image
        const imageRes = await fetch(imageUrl);
        const imageBuffer = await imageRes.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString("base64");

        // Step 2: Read BRAND LOGO from local filesystem
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        // Step 3: Ultra-Stable Generation - PRODUCT PRESERVATION MODE
        const prompt = `Professional e-commerce product photography of a children's ride-on toy vehicle.

TASK: Take the toy vehicle from the first image and place it in a premium commercial setting.

PRODUCT PRESERVATION (CRITICAL):
- Keep the product EXACTLY as shown - same colors, logos, badges, stickers, and all design details
- The toy must be instantly recognizable as the exact same product
- Preserve all manufacturer branding (Mercedes, BMW, Lamborghini, etc.)

BACKGROUND ENHANCEMENT:
- Place on a clean, premium surface: polished concrete driveway, luxury garage floor, or sleek studio backdrop
- Soft, professional lighting with subtle shadows for depth
- Slight reflection on the surface for a premium feel
- Clean, uncluttered background that makes the product pop

IMAGE QUALITY:
- Sharp focus on the entire product
- Professional color grading - vibrant but natural
- High contrast, punchy colors
- Clean edges with no artifacts
- Square 1:1 aspect ratio for e-commerce

OPTIONAL: Place the store logo (second image) on the license plate if visible.

Style: Apple product photography, Amazon hero image, premium toy catalog.`;

        const result = await model.generateContent([
            { text: prompt },
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }, // First: the car
            { inlineData: { data: logoBase64, mimeType: "image/png" } }   // Second: the logo
        ]);

        const response = await result.response;

        // Robust check for response candidates
        if (!response.candidates || response.candidates.length === 0) {
            // Check if it was blocked by safety filters
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                console.error("AI Generation Blocked:", blockReason, response.promptFeedback);
                throw new Error(`AI generation was blocked by safety filters: ${blockReason}. Please try a different product image.`);
            }

            console.error("Gemini Response Error (No Candidates):", JSON.stringify(response, null, 2));
            throw new Error("The AI failed to generate an image. This can happen due to specialized lighting or complex backgrounds. Please try again or use a different photo.");
        }

        const candidate = response.candidates[0];

        // Check for finish reason (e.g., SAFETY, RECITATION)
        if (candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS" && !candidate.content?.parts?.[0]?.inlineData) {
            console.error("Generation Stopped Prematurely:", candidate.finishReason, candidate.safetyRatings);
            throw new Error(`AI generation stopped unexpectedly (${candidate.finishReason}). This is usually due to safety filters or image complexity.`);
        }

        if (!candidate.content?.parts?.[0]?.inlineData) {
            console.error("Incomplete Response Part:", JSON.stringify(candidate, null, 2));
            throw new Error("The AI returned an partial response without image data. Please try again.");
        }

        const newImageBase64 = candidate.content.parts[0].inlineData.data;
        const newImageBuffer = Buffer.from(newImageBase64, 'base64');

        // Step 3: Upload back to Supabase
        // We'll create a new filename to avoid cache issues
        const timestamp = Date.now();
        const oldFilename = imageUrl.split('/').pop()?.split('?')[0] || 'product.jpg';
        const newFilename = `enhanced_${timestamp}_${oldFilename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('products')
            .upload(newFilename, newImageBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '3600'
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(newFilename);

        return NextResponse.json({ success: true, newImageUrl: publicUrl });

    } catch (error: any) {
        console.error("AI Image Branding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
