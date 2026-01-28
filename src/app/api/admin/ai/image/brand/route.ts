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
        const brandName = BRAND_CONFIG.name;

        for (const angle of anglesToGenerate) {
            const prompt = `You are a WORLD-CLASS COMMERCIAL PRODUCT PHOTOGRAPHER shooting for premium brands like Apple, Tesla, and Porsche catalogs.

REFERENCE IMAGES: ${validImageParts.length} photos of a children's ride-on toy vehicle from different angles. Study them ALL to understand the complete product.

═══════════════════════════════════════════════════
STEP 1: PRODUCT UNDERSTANDING
═══════════════════════════════════════════════════
Analyze every reference image to learn:
• Complete 3D form, proportions, and silhouette of this toy vehicle
• Exact paint colors and finishes (metallic, matte, glossy)
• Car manufacturer badges: Mercedes star, BMW roundel, Lamborghini bull, Ferrari horse, Jeep, Ford, etc. - note their EXACT placement
• All authentic features: LED headlights, chrome grille, alloy wheels, leather seats, steering wheel, mirrors

═══════════════════════════════════════════════════
STEP 2: BRAND SANITIZATION (CRITICAL)
═══════════════════════════════════════════════════
KEEP ONLY these brands:
✓ Original car manufacturer (BMW, Mercedes, Lamborghini, Ferrari, Jeep, Ford, etc.)
✓ ${brandName} (my store logo - provided as last image) - place on license plate

REMOVE EVERYTHING ELSE:
✗ Competitor store logos: "11cart", "Amazon", "Walmart", "Flipkart", "Hamleys", "AliExpress", "Alibaba"
✗ Any third-party seller stickers or watermarks
✗ Price tags, barcodes, promotional text
✗ Website URLs, social media handles
✗ ANY random brand stickers that are NOT the car manufacturer

═══════════════════════════════════════════════════
STEP 3: GENERATE 8K PHOTOSHOOT QUALITY IMAGE
═══════════════════════════════════════════════════
Camera Angle: ${angle.description}

PHOTOGRAPHIC EXCELLENCE:
• Shot on Phase One IQ4 150MP medium format camera
• 8K ultra-high resolution with incredible detail
• Professional studio lighting - 3-point setup with softboxes
• Dramatic rim lighting to highlight contours
• Perfect exposure, no blown highlights or crushed shadows
• Tack-sharp focus across the entire vehicle
• Shallow depth of field with subtle bokeh background

BACKDROP & SETTING:
• Seamless infinity cove (white or light grey)
• OR luxury showroom with polished concrete/marble floor
• Subtle reflection on floor surface
• Clean, distraction-free environment
• Premium automotive catalog aesthetic

TECHNICAL SPECS:
• Square 1:1 aspect ratio (perfect for e-commerce)
• Ultra-sharp, no noise or artifacts
• Professional color grading (slightly desaturated, premium feel)
• The final image should look like it was shot in a multi-million dollar photography studio

BRANDING: Add the ${brandName} logo (last image) onto the license plate if visible in this angle.

OUTPUT: A single stunning 8K-quality product photograph that would be at home on the Mercedes or Tesla website.`;

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
            newImageUrl: generatedUrls[0],
            newImageUrls: generatedUrls
        });

    } catch (error: any) {
        console.error("AI Image Branding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
