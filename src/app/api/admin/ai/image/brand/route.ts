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

                const prompt = `You are a professional e-commerce product photography and catalog-cleanup AI specialized in children's ride-on toys.

REFERENCE:
Use the uploaded image as the ONLY product reference.
The toy's physical structure, proportions, body shape, wheels, seat, lights, dashboard, handles, mirrors, stickers placement, surface detailing, and overall design MUST remain exactly the same.

DO NOT:
• Redesign the toy
• Alter car detailing
• Change body lines or shapes
• Modify colors or textures
• Add or remove parts

BRANDING RULES (VERY IMPORTANT):
• Remove or neutralize ALL existing brand names, logos, or trademarks visible on the toy (except car manufacturer badges like Mercedes, BMW, Jeep, Ford, etc.)
• Cleanly erase supplier branding without leaving marks, blur, or artifacts
• Preserve surface texture after branding removal so it looks factory-original

LOGO APPLICATION:
• Apply ${brandName} LOGO only (provided as second image)
• Logo placement must be subtle, realistic, and minimal
• Place logo only in appropriate real-world locations (e.g. small front badge, rear badge, license plate, or side panel)
• Logo must look physically printed or embedded — not pasted or floating
• Do NOT oversize the logo
• Do NOT repeat the logo multiple times

PRIMARY OBJECTIVE:
Regenerate the image into a premium, realistic, parent-trust-focused e-commerce product photo suitable for a professional ride-on toy website.

BACKGROUND:
Automatically choose ONE clean environment:
• Soft white studio background with natural floor shadow (default)
• Minimal indoor lifestyle setting (neutral walls, clean floor)
• Outdoor daylight setting (simple driveway or park surface)

BACKGROUND RULES:
• No clutter
• No people
• No children
• No pets
• No extra toys
• No text or graphics
• No cartoon or fantasy elements

LIGHTING:
• Soft professional studio lighting
• Natural daylight feel
• Even illumination across the toy
• Gentle realistic shadow beneath wheels
• No harsh reflections on plastic surfaces

COMPOSITION:
• Full toy must be clearly visible
• Natural real-world perspective
• Center or right-aligned framing
• Proper scale for children's ride-on toy
• Wheels must rest naturally on surface
• Toy must appear stable and safe

REALISM & SAFETY PERCEPTION:
• Toy should look sturdy, safe, and reliable
• Avoid racing, motion blur, or aggressive angles
• Avoid dramatic or cinematic effects

QUALITY & OUTPUT:
• Ultra-high clarity
• Sharp focus
• Clean edges
• Realistic plastic and metal textures
• Square 1:1 aspect ratio
• Commercial-grade realism suitable for zoom

STRICTLY FORBIDDEN:
• Children or adults
• Supplier branding (11cart, Amazon, Walmart, Flipkart, Hamleys, AliExpress, Alibaba)
• Extra decals
• Fake accessories
• Text overlays
• Watermarks
• Illustration or CGI look
• Over-sharpening or glow effects

FINAL OUTPUT:
One highly realistic, premium, professionally photographed ride-on toy image with clean branding and a subtle application of ${brandName} LOGO, ready for top-tier e-commerce use.`;

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
