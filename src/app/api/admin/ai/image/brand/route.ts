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

        // Support both single image and array of images
        const allImageUrls = imageUrls || (imageUrl ? [imageUrl] : []);

        if (allImageUrls.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const supabase = await createClient();
        const brandName = BRAND_CONFIG.name;

        const model = genAI.getGenerativeModel({
            model: "imagen-3.0-capability-001",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ],
            generationConfig: {
                responseModalities: ["image", "text"],
            } as any
        });

        // Read brand logo
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        const generatedUrls: string[] = [];

        // Download ALL product images first for complete context
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

        // Process each image individually but with ALL images as context
        const imagesToProcess = generateAll ? allImageData : [allImageData[0]];

        for (let i = 0; i < imagesToProcess.length; i++) {
            const currentImage = imagesToProcess[i];

            try {
                const prompt = `Edit this children's ride-on toy photo:

KEEP SAME: Exact toy design, colors, wheels, headlights, body. Same viewing angle.

REMOVE: ALL text and stickers from windshield. ALL seller logos (11CART, etc). ALL existing license plate text.

ADD TEXT "ABC TOYZ" ON LICENSE PLATE ONLY (not on grille, not on body, not on bumper - ONLY on the license plate area).

DO NOT add any car/vehicle icon logos anywhere on the car body.

BACKGROUND: Desert road with golden sunset.

OUTPUT: 1:1 square, 8K quality, sharp focus.`;

                // Build content parts: prompt + current image (to edit) + all reference images + logo
                const contentParts: any[] = [
                    { text: prompt },
                    { text: "IMAGE TO EDIT (primary):" },
                    { inlineData: { data: currentImage.base64, mimeType: "image/jpeg" } }
                ];

                // Add other images as reference (if multiple images)
                for (let j = 0; j < allImageData.length; j++) {
                    if (allImageData[j].url !== currentImage.url) {
                        contentParts.push({ text: `REFERENCE IMAGE ${j + 1} (same product, different angle):` });
                        contentParts.push({ inlineData: { data: allImageData[j].base64, mimeType: "image/jpeg" } });
                    }
                }

                // Add brand logo
                contentParts.push({ text: "BRAND LOGO to apply on license plate:" });
                contentParts.push({ inlineData: { data: logoBase64, mimeType: "image/png" } });

                const result = await model.generateContent(contentParts as any);
                const response = await result.response;

                if (!response.candidates || response.candidates.length === 0) {
                    console.error(`Failed to generate image ${i + 1}`);
                    continue;
                }

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
                    const newImageBuffer = Buffer.from(newImageBase64, 'base64');
                    const timestamp = Date.now();
                    const safeName = productName?.replace(/[^a-z0-9]/gi, '_') || 'product';
                    const newFilename = `enhanced_${timestamp}_${i}_${safeName}.jpg`;

                    const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(newFilename, newImageBuffer, {
                            contentType: 'image/jpeg',
                            cacheControl: '3600'
                        });

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('products')
                            .getPublicUrl(newFilename);
                        generatedUrls.push(publicUrl);
                    }
                }
            } catch (err) {
                console.error(`Error processing image ${i + 1}:`, err);
                continue;
            }
        }

        if (generatedUrls.length === 0) {
            throw new Error("Failed to enhance any images. Please try again.");
        }

        return NextResponse.json({
            success: true,
            newImageUrl: generatedUrls[0],
            newImageUrls: generatedUrls
        });

    } catch (error: any) {
        console.error("AI Image Enhancement Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
