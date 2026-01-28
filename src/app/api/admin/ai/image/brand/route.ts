import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        // Now accepts multiple images for product analysis
        const { imageUrl, imageUrls, productName } = await req.json();

        // Support both single imageUrl and array of imageUrls
        const allImageUrls = imageUrls || (imageUrl ? [imageUrl] : []);

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        if (allImageUrls.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const supabase = await createClient();

        // Using the verified model for image generation
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

        // Step 1: Download ALL product images for comprehensive analysis
        const imageDataParts = await Promise.all(
            allImageUrls.slice(0, 5).map(async (url: string) => {
                try {
                    const res = await fetch(url);
                    const buffer = await res.arrayBuffer();
                    const base64 = Buffer.from(buffer).toString("base64");
                    return { inlineData: { data: base64, mimeType: "image/jpeg" } };
                } catch {
                    return null;
                }
            })
        );
        const validImageParts = imageDataParts.filter(Boolean);

        if (validImageParts.length === 0) {
            throw new Error("Failed to download any images");
        }

        // Step 2: Read BRAND LOGO
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        // Step 3: Comprehensive Product Analysis + Fresh Mockup Generation
        const prompt = `You are a professional e-commerce product photographer. I'm providing ${validImageParts.length} image(s) of a children's ride-on toy vehicle from different angles.

YOUR MISSION:
1. ANALYZE all provided images to fully understand this product - its design, colors, features, brand badges, and details
2. GENERATE a fresh, professional e-commerce hero image of this EXACT product

COMPETITOR WATERMARK REMOVAL (IMPORTANT):
- If you see ANY competitor store logos, watermarks, or stickers like "11cart", "Amazon", "Walmart", "Hamleys", "Flipkart", or any other retailer branding - REMOVE them completely
- These are seller watermarks, NOT part of the actual product
- The final image must be clean of any third-party seller branding

PRODUCT DETAILS TO PRESERVE:
- The toy's exact design, shape, and proportions
- Original car manufacturer badges (Mercedes, BMW, Lamborghini, Ferrari, Jeep, etc.)
- All authentic product features: lights, wheels, seats, steering wheel
- The exact colors of the toy

NEW MOCKUP REQUIREMENTS:
- Create a FRESH angle/perspective - not a copy of the input photos
- Premium studio setting: clean white/grey gradient backdrop OR luxury garage/driveway
- Professional 3-point lighting setup
- Subtle floor reflection for premium feel
- The toy should be the hero - prominent and well-lit
- Square 1:1 aspect ratio perfect for e-commerce

BRANDING:
- Add the ${BRAND_CONFIG.name} logo (provided as the last image) to the license plate area if visible

OUTPUT: One stunning, professional e-commerce hero image that looks like it belongs on Amazon or a premium toy brand website.`;

        // Build content array: prompt + all product images + logo
        const contentParts = [
            { text: prompt },
            ...validImageParts,
            { inlineData: { data: logoBase64, mimeType: "image/png" } }
        ];

        const result = await model.generateContent(contentParts as any);
        const response = await result.response;

        // Robust check for response candidates
        if (!response.candidates || response.candidates.length === 0) {
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                console.error("AI Generation Blocked:", blockReason, response.promptFeedback);
                throw new Error(`AI generation was blocked by safety filters: ${blockReason}. Please try different images.`);
            }
            console.error("Gemini Response Error (No Candidates):", JSON.stringify(response, null, 2));
            throw new Error("The AI failed to generate an image. Please try again.");
        }

        const candidate = response.candidates[0];

        // Find the image part in the response
        let newImageBase64 = null;
        if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
                if ((part as any).inlineData?.data) {
                    newImageBase64 = (part as any).inlineData.data;
                    break;
                }
            }
        }

        if (!newImageBase64) {
            console.error("No image in response:", JSON.stringify(candidate, null, 2));
            throw new Error("The AI returned a response without image data. Please try again.");
        }

        const newImageBuffer = Buffer.from(newImageBase64, 'base64');

        // Step 4: Upload to Supabase
        const timestamp = Date.now();
        const newFilename = `mockup_${timestamp}_${productName?.replace(/[^a-z0-9]/gi, '_') || 'product'}.jpg`;

        const { error: uploadError } = await supabase.storage
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
