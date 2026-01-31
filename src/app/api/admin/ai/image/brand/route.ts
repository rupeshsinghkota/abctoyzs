import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

import { AI_BACKGROUND_SCENES, getHeroScene } from "@/config/ai-scenes";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const maxDuration = 300; // 5 minute timeout

export async function POST(req: Request) {
    try {
        const { imageUrl, imageUrls, productName, generateAll } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const supabase = await createClient();

        // Handle input images
        let allImageUrls: string[] = [];
        if (imageUrls && Array.isArray(imageUrls)) {
            allImageUrls = imageUrls;
        } else if (imageUrl) {
            allImageUrls = [imageUrl];
        }

        if (allImageUrls.length === 0) {
            return NextResponse.json(
                { error: "No image URL provided" },
                { status: 400 }
            );
        }

        console.log(`Processing ${allImageUrls.length} images for product: ${productName}`);

        // OPTION A: ONE-TO-ONE ENHANCEMENT (Background Swap / Quality Up)
        const CONCURRENCY_LIMIT = 2;
        const results = new Array(allImageUrls.length).fill(null);
        let errors: string[] = [];

        // Fetch Logo once
        let logoBase64 = "";
        try {
            const logoResp = await fetch("https://abctoyzs.vercel.app/images/logo.png");
            if (logoResp.ok) {
                const buffer = await logoResp.arrayBuffer();
                logoBase64 = Buffer.from(buffer).toString("base64");
            }
        } catch (e) {
            console.error("Failed to fetch logo", e);
        }

        // Cleanup: Delete PREVIOUS generated images for this product if generateAll is true
        if (generateAll) {
            const { data: existingFiles, error: listError } = await supabase.storage
                .from('products')
                .list('', { search: 'enhanced_' });

            if (existingFiles && !listError) {
                const filesToDelete = existingFiles
                    .filter(f => f.name.includes(productName?.replace(/[^a-z0-9]/gi, '_') || 'product'))
                    .map(f => f.name);

                if (filesToDelete.length > 0) {
                    console.log(`Deleting ${filesToDelete.length} old AI images...`);
                    await supabase.storage.from('products').remove(filesToDelete);
                }
            }
        }

        async function processImageEnhancement(sourceImageUrl: string, index: number) {
            let imageGenerated = false;
            let retries = 0;
            const MAX_RETRIES = 3;

            while (!imageGenerated && retries <= MAX_RETRIES) {
                try {
                    // Fetch the specific source image
                    const imageResp = await fetch(sourceImageUrl);
                    if (!imageResp.ok) throw new Error("Failed to fetch source image");
                    const imageBuffer = await imageResp.arrayBuffer();
                    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

                    console.log(`Enhancing Image ${index + 1} (Try ${retries + 1})...`);

                    const model = genAI.getGenerativeModel({
                        model: "gemini-3-pro-image-preview",
                        generationConfig: {
                            temperature: 0.0,
                            topP: 0.95,
                            topK: 40,
                        },
                        safetySettings: [
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        ],
                    }, { timeout: 300000 });

                    // DYNAMIC BACKGROUND SELECTOR (Majestic Hero Scenes)
                    const scene = getHeroScene();
                    const backgroundPrompt = `
- **SCENE**: ${scene.description}.
- **LIGHTING**: ${scene.lighting}
- **STYLE**: ${scene.style}, Automotive Commercial Style, High-End Feel.`;

                    const prompt = `COMMERCIAL PHOTO RETOUCHING TASK:

INPUT: 1 Reference Image.
TASK: IMPROVE QUALITY (8K, SHARPNESS, LIGHTING) BUT KEEP SUBJECT IDENTICAL.

STRICT PRESERVATION RULES:
1. **COMPOSITION LOCK (CRITICAL)**: DO NOT ZOOM OUT. DO NOT CHANGE FRAMING. If the image is a Close-up/Interior, KEEP IT A CLOSE-UP.
2. **VIEWPOINT RESPECT**: 
   - If Input = Back View -> Output MUST be Back View.
   - If Input = Interior -> Output MUST be Interior.
   - Do NOT turn the car around.
3. **GEOMETRY & COLOR LOCK**: 
   - THE COLOR IS SACRED. If it is Red, IT MUST STAY THE EXACT SAME RED. 
   - Do not apply color filters. Do not change white balance.
   - The car's shape, wheel spokes, and stickers must NOT change.
4. **NO RE-DESIGN**: Do not "modernize" the car. Do not "fix" the design. Keep it exactly as is.
5. **ALLOWED ENHANCEMENTS**: 
   - Remove grain/noise.
   - Sharpen textures.
   - Apply "Neutral Studio Lighting" (Pure White Light).
   - Replace Background.

BRANDING & TEXT PRESERVATION:
1. **PRESERVE PRODUCT AUTHENTICITY (CRITICAL)**: 
   - **KEEP**: Car Brand Logos that are part of the physical product (e.g., Ferrari shields on the hood/sides, Mercedes stars on the grille). These are DESIRED.
   - **KEEP**: Technical specs text (e.g., "12V 7Ah", "4 Motors", "Remote Control"). Neatly reproduce these if they are present in the source.
2. **STRICT WATERMARK REMOVAL**: 
   - **ERASE**: All seller/retailer logos, corner watermarks, and circular icons (e.g., "JN Creations", "11Cart", or any shop branding).
   - **ERASE**: Any floating arrows, promotional text, or generic banners ("Swing Mode", "Forward/Backward").
   - **CLEAN SURFACE**: Ensure the car body and the environment are free of digital overlays and stickers that are not part of the physical toy.
3. **LICENSE PLATE**: Must read "ABC TOYZ".

BACKGROUND:
${backgroundPrompt}
- **STYLE**: Ultra-Realistic.
- **LIGHTING**: PURE DAYLIGHT (5500K). NO ORANGE TINT. NO FILTERS.

NEGATIVE PROMPT:
- change color, change paint, orange tint, blue tint, filter, color grading, change design, new wheels, different stickers, vector art, painting, low resolution, blurry, added text, new brand logos, ford logo, bmw logo.

ASPECT RATIO: 1:1 (SQUARE).`;

                    const contentParts: any[] = [{ text: prompt }];
                    contentParts.push({ inlineData: { data: imageBase64, mimeType: "image/jpeg" } });

                    if (logoBase64) {
                        contentParts.push({ text: "BRAND LOGO:" });
                        contentParts.push({ inlineData: { data: logoBase64, mimeType: "image/png" } });
                    }

                    const result = await model.generateContent(contentParts);
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
                            // Save
                            const fileName = `enhanced_${productName?.replace(/[^a-z0-9]/gi, '_') || 'product'}_${index}_${Date.now()}.png`;
                            const { error: uploadError } = await supabase.storage
                                .from('products')
                                .upload(fileName, newImageBuffer, { contentType: 'image/png', upsert: true });

                            if (!uploadError) {
                                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                                results[index] = publicUrl; // Success
                                imageGenerated = true; // Break loops
                            }
                        }
                    }
                } catch (error: any) {
                    console.error(`Error enhancing image ${index}:`, error);
                    if (error.message?.includes("503") || error.message?.includes("429")) {
                        retries++;
                        await new Promise(r => setTimeout(r, retries * 2000));
                    } else {
                        errors.push(`Image ${index}: ${error.message}`);
                        break;
                    }
                }
            } // end while
        }

        // Parallel Execution (Chunked by Limit)
        for (let i = 0; i < allImageUrls.length; i += CONCURRENCY_LIMIT) {
            const chunk = allImageUrls.slice(i, i + CONCURRENCY_LIMIT);
            await Promise.all(chunk.map((url: string, offset: number) =>
                processImageEnhancement(url, i + offset)
            ));
        }

        const successCount = results.filter(u => u !== null).length;

        if (successCount === 0) {
            return NextResponse.json({ error: "Failed to enhance images. " + errors.join(", ") }, { status: 500 });
        }

        // Return FULL 'results' array (including nulls) to preserve index alignment with frontend
        return NextResponse.json({
            success: true,
            newImageUrl: results[0],
            newImageUrls: results
        });

    } catch (error: any) {
        console.error("AI Image Enhancement Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
    }
}
