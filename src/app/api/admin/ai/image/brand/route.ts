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
            "gemini-3-pro-image-preview" // STRICT: Gemini 3 Pro (Nano Banana Pro) ONLY
        ];

        const generatedUrls: string[] = []; // We will fill this by index to keep order
        const results = new Array(angles.length).fill(null);
        let errors: string[] = [];

        // Concurrency Control: Run max 2 at a time to avoid 503 Overload
        const CONCURRENCY_LIMIT = 2;

        async function processAngleWithRetry(currentAngle: string, index: number) {
            if (!generateAll && index > 0) return; // Skip others if single generation

            let imageGenerated = false;

            for (const modelName of modelsToTry) {
                // Retry loop for 503/429 errors
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        console.log(`Attempting generation (Try ${attempt}) with model: ${modelName} for angle: ${currentAngle}`);

                        const model = genAI.getGenerativeModel({
                            model: modelName,
                            generationConfig: {
                                temperature: 0.1, // Very Low randomness = High Consistency
                                topP: 0.95,
                                topK: 40,
                            },
                            safetySettings: [
                                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            ],
                        });

                        // Enhanced "World Class" Prompt
                        const prompt = `COMMERCIAL PRODUCT PHOTOGRAPHY:

TARGET: Photorealistic 8K image of the car shown in reference images.
CONTEXT: The provided reference images are DIFFERENT ANGLES of the SAME SINGLE PHYSICAL PRODUCT. Use them together to understand the exact 3D geometry and details of this one specific car.
ANGLE: ${currentAngle}.

STRICT CONSISTENCY RULES:
1. IDENTICAL MATCH: The generated car must be an EXACT COPY of the reference vehicle.
   - PRESERVE: Exact Wheel Rims (count spokes), exact Headlight shape, exact Grille pattern.
   - DO NOT CHANGE THE CAR. Only place it in a new environment.

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
                                const newImageBuffer = Buffer.from(newImageBase64 as string, 'base64');
                                const timestamp = Date.now();
                                const safeName = productName?.replace(/[^a-z0-9]/gi, '_') || 'product';
                                const newFilename = `enhanced_${timestamp}_${index}_${safeName}.jpg`;

                                const { error: uploadError } = await supabase.storage
                                    .from('products')
                                    .upload(newFilename, newImageBuffer, { contentType: 'image/jpeg', cacheControl: '3600' });

                                if (!uploadError) {
                                    const { data: { publicUrl } } = supabase.storage
                                        .from('products')
                                        .getPublicUrl(newFilename);
                                    results[index] = publicUrl; // Store by index to preserve order
                                    imageGenerated = true;
                                    return; // Success, exit retry loop and model loop (function returns)
                                } else {
                                    console.error(`Upload error angle ${index}:`, uploadError);
                                }
                            }
                        }
                    } catch (err: any) {
                        const isOverload = err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('Overloaded');
                        console.error(`Model ${modelName} angle ${currentAngle} attempt ${attempt} failed:`, err.message);

                        if (isOverload && attempt < 3) {
                            const waitTime = 2000 * attempt; // Backoff: 2s, 4s, 6s...
                            console.log(`Waiting ${waitTime}ms before retry...`);
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue; // Retry
                        } else {
                            errors.push(`${currentAngle} (${modelName}): ${err.message}`);
                            break; // Fatal error or max retries, try next model (if any)
                        }
                    }
                }
                if (imageGenerated) break;
            }

            if (!imageGenerated) {
                console.error(`Failed to generate image for angle ${currentAngle}`);
            }
        }

        // Chunk execution
        for (let i = 0; i < angles.length; i += CONCURRENCY_LIMIT) {
            const chunk = angles.slice(i, i + CONCURRENCY_LIMIT);
            const promises = chunk.map((angle, chunkIndex) => processAngleWithRetry(angle, i + chunkIndex));
            await Promise.all(promises);
        }

        // Filter out nulls
        generatedUrls.push(...results.filter(url => url !== null));

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
