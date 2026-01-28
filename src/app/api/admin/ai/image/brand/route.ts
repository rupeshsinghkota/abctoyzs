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
            model: "gemini-2.0-flash-exp-image-generation",
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

        // Process each image individually - enhance background while keeping product identical
        const imagesToProcess = generateAll ? allImageUrls : [allImageUrls[0]];

        for (let i = 0; i < imagesToProcess.length; i++) {
            const currentImageUrl = imagesToProcess[i];

            try {
                // Download current image
                const imageRes = await fetch(currentImageUrl);
                const imageBuffer = await imageRes.arrayBuffer();
                const imageBase64 = Buffer.from(imageBuffer).toString("base64");

                const prompt = `PHOTO EDITING TASK: Transform this product image into professional e-commerce photography.

INPUT: A photo of a children's ride-on electric toy car.

WHAT TO DO:

1. KEEP THE PRODUCT DETAILS EXACTLY AS-IS
   - Same toy car model with same design
   - Same colors - every color must match perfectly  
   - Same car brand badges (Mercedes, BMW, Lamborghini, Ferrari, Jeep, Ford, Audi, Porsche, etc.)
   - Same headlights, wheels, seats, mirrors, steering wheel design
   - DO NOT redesign, recolor, or modify any product details

2. ANGLE ADJUSTMENT (ALLOWED)
   - You MAY adjust the viewing angle for better composition
   - Choose a flattering e-commerce angle (3/4 front view works great)
   - The product details must stay the same, just the perspective can change

3. REMOVE COMPETITOR WATERMARKS
   - Remove: "11cart", "Amazon", "Walmart", "Flipkart", "Hamleys", "AliExpress", "Alibaba" logos
   - Remove: Seller stickers, price tags, website URLs, promotional overlays
   - KEEP: Car manufacturer badges (BMW, Mercedes, etc.) - these are part of the product!

4. PROFESSIONAL BACKGROUND
   - Add a clean, professional e-commerce background:
     * Pure white seamless studio OR light grey gradient OR polished floor
   - Professional studio lighting with soft shadows
   - Subtle floor reflection for premium catalog look

5. OUTPUT
   - Square 1:1 aspect ratio
   - High quality, sharp, professional e-commerce photography
   - Should look like a premium Amazon or toy store listing

SUMMARY: Keep product details (colors, design, badges) exactly the same. You can adjust the angle and must replace the background with professional studio setting.`;
                const contentParts = [
                    { text: prompt },
                    { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
                    { inlineData: { data: logoBase64, mimeType: "image/png" } }
                ];

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
