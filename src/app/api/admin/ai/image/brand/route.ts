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

                const prompt = `You are a professional e-commerce product photography AI specialized in children's ride-on toys.

REFERENCE:
Use the uploaded image as the ONLY product reference.
The toy's physical structure, proportions, body shape, wheels, seat, lights, dashboard, handles, mirrors, surface detailing, and overall design MUST remain exactly the same.

DO NOT:
• Redesign the toy
• Alter car detailing
• Change body lines or shapes
• Modify colors or textures
• Add or remove parts

BRANDING CLEANUP (CRITICAL - DO THIS FIRST):
1. REMOVE all supplier/seller text and stickers:
   • Windshield text (like "TAUTR", "CLOUD", random text)
   • Side panel stickers from sellers
   • Any website URLs or promotional text
   • Random model numbers or codes
   
2. KEEP only car manufacturer branding:
   • Ford, Jeep, BMW, Mercedes, Lamborghini, Ferrari, Audi, Porsche badges
   • These are part of the licensed product design

LICENSE PLATE - VERY IMPORTANT:
• The license plate MUST show "${brandName}" text clearly
• Replace any existing license plate text with "${brandName}"
• Use the logo provided (second image) as reference for placement
• Text should be clean, readable, and properly sized for the plate
• This is the ONLY place to put store branding

PRIMARY OBJECTIVE:
Create a STUNNING, CINEMATIC product photo with a BEAUTIFUL OUTDOOR BACKGROUND.
DO NOT use plain white or grey studio backgrounds. Use scenic outdoor settings.

BACKGROUND (CHOOSE BEST MATCH FOR VEHICLE TYPE):
For Jeep/Off-road/SUV toys:
• Desert highway at golden hour with dramatic rock formations
• Mountain trail with sunset sky
• Adventure road with dust and warm lighting

For Sports cars (Lamborghini, Ferrari, Porsche):
• Luxury mansion driveway at sunset
• City street with bokeh lights
• Racetrack or upscale garage

For Classic cars (Mercedes, BMW, Audi):
• Elegant estate driveway
• Premium showroom or upscale home garage
• Scenic coastal road

For Motorcycles/Bikes:
• Open road with dramatic sky
• Mountain backdrop

BACKGROUND RULES:
• Cinematic, visually stunning backgrounds
• Golden hour lighting preferred (warm sunset tones)
• Winding road disappearing into distance adds depth
• Rock formations, mountains, or scenic landscapes
• No clutter, no people, no children, no pets
• Background should enhance product appeal

LIGHTING:
• Golden hour / sunset lighting (warm orange/golden tones)
• Dramatic but natural lighting
• Beautiful lens flare from sun (subtle)
• Rim lighting on the toy to make it pop
• Realistic shadows for depth
• Professional automotive photography style

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
