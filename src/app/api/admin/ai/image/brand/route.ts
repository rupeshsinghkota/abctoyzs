import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Different angles for e-commerce product photography
const SHOT_ANGLES = [
    { name: "hero_front", description: "Front 3/4 angle view - the classic hero shot showing the front and one side. This is the main showcase image." },
    { name: "side_profile", description: "Pure side profile view showing the full length of the vehicle from directly beside it." },
    { name: "rear_quarter", description: "Rear 3/4 angle view showing the back and one side of the vehicle." },
    { name: "front_detail", description: "Front-facing view showing the grille, headlights, and front design details up close." },
    { name: "interior_cockpit", description: "Interior view focusing on the steering wheel, dashboard, and seat from a child's perspective." }
];

export async function POST(req: Request) {
    try {
        const { imageUrls, productName, generateAll, angleIndex } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        if (!imageUrls || imageUrls.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const supabase = await createClient();

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

        // Download ALL source images for comprehensive product understanding
        const imageDataParts = await Promise.all(
            imageUrls.slice(0, 6).map(async (url: string) => {
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

        // Read brand logo
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        // Determine which angle(s) to generate
        const anglesToGenerate = generateAll
            ? SHOT_ANGLES.slice(0, Math.min(imageUrls.length, 5))
            : [SHOT_ANGLES[angleIndex || 0]];

        const generatedUrls: string[] = [];

        for (const angle of anglesToGenerate) {
            const prompt = `You are a world-class e-commerce product photographer. Study ALL ${validImageParts.length} reference images carefully - they show the SAME toy vehicle from different angles.

STEP 1 - PRODUCT ANALYSIS:
Examine every reference image to understand:
- Complete 3D shape and proportions of this toy vehicle
- Exact colors and materials (metallic paint, plastic, rubber tires, etc.)
- All logos and badges (Mercedes, BMW, Lamborghini, etc.) - their exact placement and appearance
- Special features: headlights, taillights, mirrors, doors, seats, steering wheel

STEP 2 - WATERMARK REMOVAL:
COMPLETELY REMOVE any competitor/seller branding visible in stock photos:
- "11cart", "Amazon", "Walmart", "Flipkart", "Hamleys", "AliExpress" logos or text
- Any watermarks, price tags, or promotional stickers
- Website URLs or seller information
These are NOT part of the actual product and must be erased.

STEP 3 - GENERATE NEW IMAGE:
Create a BRAND NEW professional photo of this EXACT vehicle from this specific angle:
📷 ${angle.description}

SETTING:
- Premium studio with seamless grey/white gradient backdrop
- OR luxury garage with polished concrete floor
- Professional 3-point lighting with soft shadows
- Subtle floor reflection for high-end catalog feel

CRITICAL RULES:
- The vehicle must look EXACTLY like the reference images (same model, colors, badges)
- Car brand badges (Mercedes star, BMW logo, Lamborghini bull, etc.) MUST be clearly visible
- Generate a completely NEW angle/composition, not copy the input photos
- Square 1:1 aspect ratio
- Photorealistic, sharp, advertising-quality

BRANDING: Add "${BRAND_CONFIG.name}" logo (last image) to the license plate if visible in this angle.`;

            const contentParts = [
                { text: prompt },
                ...validImageParts,
                { inlineData: { data: logoBase64, mimeType: "image/png" } }
            ];

            try {
                const result = await model.generateContent(contentParts as any);
                const response = await result.response;

                if (!response.candidates || response.candidates.length === 0) {
                    console.error(`Failed to generate ${angle.name}`);
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
                    const newFilename = `mockup_${angle.name}_${timestamp}_${safeName}.jpg`;

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
                console.error(`Error generating ${angle.name}:`, err);
                continue;
            }
        }

        if (generatedUrls.length === 0) {
            throw new Error("Failed to generate any images. Please try again.");
        }

        return NextResponse.json({
            success: true,
            newImageUrl: generatedUrls[0], // For single image compatibility
            newImageUrls: generatedUrls    // For bulk generation
        });

    } catch (error: any) {
        console.error("AI Image Branding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
