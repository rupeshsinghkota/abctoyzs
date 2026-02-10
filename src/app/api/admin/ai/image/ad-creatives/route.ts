import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { productName, price, originalImageUrl, vibe } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const supabase = await createClient();
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        });

        // 1. Prepare Inputs (Logo & Product Image)
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        let productBase64 = null;
        if (originalImageUrl) {
            const prodRes = await fetch(originalImageUrl);
            const prodBuffer = await prodRes.arrayBuffer();
            productBase64 = Buffer.from(prodBuffer).toString("base64");
        }

        // 2. Define Prompts for Each Aspect Ratio
        // We define 3 separate generation tasks.

        const generateImage = async (format: 'SQUARE' | 'STORY' | 'LANDSCAPE') => {
            let aspectRatioDesc = "";
            let compositionDesc = "";

            if (format === 'SQUARE') {
                aspectRatioDesc = "Square 1:1 Aspect Ratio (1080x1080)";
                compositionDesc = "Centered composition, perfect for Instagram Feed. Product in center, text above or below.";
            } else if (format === 'STORY') {
                aspectRatioDesc = "Vertical 9:16 Aspect Ratio (1080x1920)";
                compositionDesc = "Tall full-screen composition. Product in lower-middle. Leave TOP 30% EMPTY for UI elements. Immersive floor/background.";
            } else { // LANDSCAPE
                aspectRatioDesc = "Wide 1.91:1 Aspect Ratio (1200x628)";
                compositionDesc = "Cinematic wide composition. Product on Right side, Negative space on Left for text overlay.";
            }

            const prompt = `A professional advertising creative for a Ride-on Toy ("${productName}").
            FORMAT: ${aspectRatioDesc}.
            VIBE: ${vibe || "Premium Luxury"}.
            COMPOSITION: ${compositionDesc}.
            
            VISUAL ELEMENTS:
            1. **BACKGROUND:** High-end, photorealistic scene matching the vibe (e.g. Modern Driveway, Sunny Park, or Racetrack).
            2. **PRODUCT:** The vehicle provided in the input image. Isolate it and blend it naturally into the scene (correct lighting, shadows).
            3. **TEXT OVERLAY:** Add a commercially designed price tag or badge: "Only ₹${price}".
            4. **LOGO:** Discreetly placed ABC Toyz logo.
            
            CRITICAL:
            - The car MUST look exactly like the reference image.
            - Include a happy child interacting with the car if it fits the composition naturaly.
            - High commercial production value.`;

            const inputs = [prompt, { inlineData: { data: logoBase64, mimeType: "image/png" } }];
            if (productBase64) {
                inputs.push({ inlineData: { data: productBase64, mimeType: "image/jpeg" } });
            }

            const result = await model.generateContent(inputs);
            const response = await result.response;
            const candidate = response.candidates?.[0];

            if (!candidate?.content?.parts?.[0]?.inlineData) {
                throw new Error(`Failed to generate ${format} image`);
            }

            const imageBase64 = candidate.content.parts[0].inlineData.data;
            const buffer = Buffer.from(imageBase64, 'base64');
            const filename = `ad_creative_${format.toLowerCase()}_${Date.now()}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filename, buffer, { contentType: 'image/jpeg' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filename);

            return publicUrl;
        };

        // 3. Run Generations in Parallel
        const [squareUrl, storyUrl, landscapeUrl] = await Promise.all([
            generateImage('SQUARE'),
            generateImage('STORY'),
            generateImage('LANDSCAPE')
        ]);

        return NextResponse.json({
            success: true,
            creatives: {
                square: squareUrl,
                story: storyUrl,
                landscape: landscapeUrl
            }
        });

    } catch (error: any) {
        console.error("Ad Creative Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
