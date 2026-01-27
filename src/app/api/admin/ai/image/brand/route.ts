import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { imageUrl, productName } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const supabase = await createClient();

        // Using the verified model for image generation
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        // Step 1: Download original product image
        const imageRes = await fetch(imageUrl);
        const imageBuffer = await imageRes.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString("base64");

        // Step 2: Read BRAND LOGO from local filesystem
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        // Step 3: Generate Branded/Enhanced Version
        const prompt = `
            ROLE: You are the world's most elite Commercial Photographer and Art Director, specialized in high-stakes automotive advertising for "${BRAND_CONFIG.name}".
            
            ASSETS PROVIDED:
            1. PRODUCT_IMAGE: The original photo of the vehicle.
            2. BRAND_LOGO: The official "${BRAND_CONFIG.name}" logo file.
            
            TASK: 
            Transform the PRODUCT_IMAGE into an "AMAZING COMMERCIAL PHOTOGRAPHY MASTERPIECE" that would be the centerpiece of a global advertising campaign. It must look absolutely stunning on a premium product page and high-impact television or digital ads.
            
            ARTISTIC DIRECTION:
            1. ASPECT RATIO: The final image MUST be a PERFECT 1:1 SQUARE.
            2. VISUAL STYLE: Ultra-luxurious, cinematic, and hyper-realistic. The toy vehicle should be indistinguishable from a full-sized exotic supercar or premium SUV.
            3. SCENE & COMPOSITION: Create a breathtaking, high-end environment (e.g., a modern architectural masterpiece, a sunset mountain road, or a futuristic neon-lit showroom). Ensure the vehicle's stance is powerful and heroic.
            4. LIGHTING & ATMOSPHERE: Use complex "Golden Hour" lighting or high-end studio light-painting. Include incredibly realistic specular highlights, volumetric lighting, and deep, rich shadows.
            5. AUTHENTIC CO-BRANDING (ELITE INTEGRATION):
               - KEEP ORIGINAL CAR BRANDING: Do NOT remove any existing manufacturer logos, names, or badges (e.g., keep "Jeep", "Ford", "Mercedes" logos). The vehicle should retain its authentic brand identity.
               - ADD BRAND LOGO: Use the provided BRAND_LOGO asset as the SOLE source for the new branding. No generic fonts.
               - PLACEMENT: Integrate the BRAND_LOGO onto the LICENSE PLATE and as a subtle, high-gloss "physical badge" on the hood or rear (ensuring it doesn't overlap or obscure the original manufacturer branding). It must follow the car's curvature and lighting perfectly.
            6. TECHNICAL EXCELLENCE: 
               - MATERIALITY: Render hyper-realistic paint finishes (metallic flakes, deep gloss, or satin matte) and authentic tire and carbon-fiber textures.
               - OPTICS: Use professional "depth of field" (bokeh) to make the vehicle pop. 8k resolution textures with zero artifacts.
            
            Output ONLY the final breathtaking high-resolution square masterpiece.
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
            { inlineData: { data: logoBase64, mimeType: "image/png" } }
        ]);

        const response = await result.response;
        const candidates = response.candidates;

        if (!candidates || candidates.length === 0 || !candidates[0].content.parts[0].inlineData) {
            throw new Error("AI failed to generate an image response.");
        }

        const newImageBase64 = candidates[0].content.parts[0].inlineData.data;
        const newImageBuffer = Buffer.from(newImageBase64, 'base64');

        // Step 3: Upload back to Supabase
        // We'll create a new filename to avoid cache issues
        const timestamp = Date.now();
        const oldFilename = imageUrl.split('/').pop()?.split('?')[0] || 'product.jpg';
        const newFilename = `enhanced_${timestamp}_${oldFilename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
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
