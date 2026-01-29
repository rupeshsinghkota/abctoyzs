import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { imageUrl, imageUrls, productName, generateAll } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const allImageUrls = imageUrls || (imageUrl ? [imageUrl] : []);
        if (allImageUrls.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const supabase = await createClient();

        // Read brand logo
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        // Download ALL product images first
        const allImageData: Array<{ url: string; base64: string }> = [];
        for (const imgUrl of allImageUrls) {
            try {
                const imageRes = await fetch(imgUrl);
                const imageBuffer = await imageRes.arrayBuffer();
                const imageBase64 = Buffer.from(imageBuffer).toString("base64");
                allImageData.push({ url: imgUrl, base64: imageBase64 });
            } catch (err) {
                console.error(`Failed to download image: ${imgUrl}`);
            }
        }

        const angles = [
            "front 3/4 view",
            "side profile view",
            "rear 3/4 view",
            "front direct view"
        ];

        // Models to try in order of preference
        const modelsToTry = [
            "gemini-3-pro-image-preview", // Primary: Nano Banana Pro
            "gemini-2.0-flash"          // Fallback: Stable Flash 2.0
        ];

        const generatedUrls: string[] = [];
        let errors: string[] = [];

        for (let i = 0; i < (generateAll ? angles.length : 1); i++) {
            const currentAngle = angles[i];
            let imageGenerated = false;

            // Try each model until one works
            for (const modelName of modelsToTry) {
                try {
                    console.log(`Attempting generation with model: ${modelName} for angle: ${currentAngle}`);

                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        safetySettings: [
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        ],
                    });

                    // Enhanced "World Class" Prompt
                    const prompt = `COMMERCIAL PRODUCT PHOTOGRAPHY:
                    
TARGET: Photorealistic 8K image of the specific ride-on toy in the reference images.
ANGLE: ${currentAngle}.

CRITICAL REQUIREMENTS:
1. PRODUCT FIDELITY: The toy must look EXACTLY like the reference images (same wheels, body shape, details).
2. BRANDING EDIT: 
   - REMOVE all text/stickers from the windshield.
   - REMOVE any "11CART", "UEKUT" logos.
   - ADD "ABC TOYZ" text clearly on the license plate.
3. BACKGROUND STRATEGY (AI Decide):
   - Jeeps/SUVs: Epic desert sunset with dust trails or mountain pass.
   - Supercars: Ultra-modern luxury driveway or city night neon.
   - Bikes: Scenic coast road or race track.
4. LIGHTING: Golden hour or cinematic studio lighting. High contrast, sharp shadows.
5. QUALITY: Unreal Engine 5 render quality, sharp focus, no blur, no distortions.

Aspect Ratio: 1:1 (Square).`;

                    const contentParts: any[] = [{ text: prompt }];

                    // Add reference images
                    for (let j = 0; j < allImageData.length; j++) {
                        contentParts.push({ text: `REFERENCE IMAGE ${j + 1}:` });
                        contentParts.push({ inlineData: { data: allImageData[j].base64, mimeType: "image/jpeg" } });
                    }

                    // Add brand logo
                    contentParts.push({ text: "BRAND LOGO (for license plate):" });
                    contentParts.push({ inlineData: { data: logoBase64, mimeType: "image/png" } });

                    const result = await model.generateContent(contentParts as any);
                    const response = await result.response;

                    if (response.candidates && response.candidates.length > 0) {
                        const candidate = response.candidates[0];
                        let newImageBase64 = null;

                        if (candidate.content?.parts) {
                            for (const part of candidate.content.parts) {
                                if ((part as any).inlineData?.data) {
                                    newImageBase64 = (part as any).inlineData.data;
                                    break;
                                }
                            }
                        }

                        if (newImageBase64) {
                            // Success! Upload and break model loop
                            const newImageBuffer = Buffer.from(newImageBase64, 'base64');
                            const timestamp = Date.now();
                            const safeName = productName?.replace(/[^a-z0-9]/gi, '_') || 'product';
                            const newFilename = `enhanced_${timestamp}_${i}_${safeName}.jpg`;

                            const { error: uploadError } = await supabase.storage
                                .from('products')
                                .upload(newFilename, newImageBuffer, { contentType: 'image/jpeg', cacheControl: '3600' });

                            if (!uploadError) {
                                const { data: { publicUrl } } = supabase.storage
                                    .from('products')
                                    .getPublicUrl(newFilename);
                                generatedUrls.push(publicUrl);
                                imageGenerated = true; // Mark as success
                                break; // Stop trying models for this angle
                            }
                        }
                    }
                } catch (err: any) {
                    console.error(`Model ${modelName} failed:`, err.message);
                    errors.push(`${modelName}: ${err.message}`);
                }
            } // End model loop

            if (!imageGenerated) {
                console.error(`Failed to generate image for angle ${currentAngle} with all models.`);
            }
        } // End angle loop

        if (generatedUrls.length === 0) {
            throw new Error(`Generation failed. Errors: ${errors.join(" | ")}`);
        }

        return NextResponse.json({
            success: true,
            newImageUrl: generatedUrls[0],
            newImageUrls: generatedUrls
        });

    } catch (error: any) {
        console.error("AI Image Enhancement Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
    }
}
