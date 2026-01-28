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
                // Build context with ALL images so AI understands the complete product
                const totalImages = allImageData.length;

                const prompt = `You are an expert photo editor, NOT an image generator. Your job is to EDIT this product photo, not recreate it.

MULTI-IMAGE CONTEXT:
I am providing ${totalImages} images of the SAME product from different angles.
• Image 1 is the PRIMARY image you should edit
• Other images (2-${totalImages}) are REFERENCE images showing the same product from other angles
• Use ALL images to understand what this exact product looks like
• The product is the SAME in all images - same model, same color, same design

YOUR TASK: Edit Image 1 only, but use all reference images to ensure accuracy.

⚠️ CRITICAL RULE - PRODUCT MUST BE IDENTICAL:
The toy in your output must look EXACTLY like the toy in the input photo.
This is PHOTO EDITING, not image generation.

WHAT MUST STAY EXACTLY THE SAME (PIXEL-PERFECT):
• Exact same wheel design and spoke pattern
• Exact same headlights shape and style  
• Exact same grille design
• Exact same body panels and shapes
• Exact same seat design
• Exact same roll bar/handles
• Exact same colors (red stays red, black stays black)
• Exact same proportions and size ratios
• Exact same viewing angle

If the input has 6-spoke wheels, output must have 6-spoke wheels.
If the input has round headlights, output must have round headlights.
DO NOT substitute similar-looking parts.

WHAT TO EDIT:

1. ⛔ REMOVE ALL TEXT FROM WINDSHIELD - CRITICAL:
   • Remove "11CART", "11cart", "UEKUT", "UERUT", "ICANT", "CLOUD", "TAUTR" - ALL OF IT
   • The windshield must be COMPLETELY CLEAN and clear
   • No text, no stickers, no logos on the windshield
   • Just clean transparent/tinted glass
   
2. ⛔ REMOVE SIDE PANEL STICKERS:
   • Remove any seller logos or promotional stickers from side panels
   • The car side should only show the natural design, no added stickers
   
3. ✅ KEEP manufacturer branding:
   • "FORD" text on grille - KEEP THIS, it's part of the licensed product
   • Any car brand badges (Ford, Jeep, BMW, Mercedes, etc.)

4. 🔤 LICENSE PLATE TEXT - MUST BE EXACT:
   • The license plate MUST show exactly: "ABC TOYZ"
   • Not random letters or numbers
   • Not "BI+-SRY" or "UBI-EICE" or gibberish
   • Clean, readable "ABC TOYZ" text on white plate
   • This is the store branding

5. 🌄 BACKGROUND:
   • Replace background with scenic outdoor setting
   • Desert road with sunset for Jeep/off-road vehicles
   • Keep realistic shadow under the vehicle

IMAGE QUALITY - ULTRA HIGH:
• Generate at maximum resolution available (8K quality)
• Ultra-sharp focus on every detail
• No blur, no softness
• Crisp edges on every part of the toy
• Professional commercial photography quality
• Every texture visible: plastic shine, rubber tires, metal parts

OUTPUT: The SAME toy, clean windshield, "ABC TOYZ" on license plate, stunning outdoor background, 8K quality.

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
