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
            ROLE: You are a World-Class Commercial Photographer and Art Director for "${BRAND_CONFIG.name}".
            
            ASSETS PROVIDED:
            1. PRODUCT_IMAGE: The original photo of the vehicle.
            2. BRAND_LOGO: The official "${BRAND_CONFIG.name}" logo.
            
            TASK: 
            Transform the PRODUCT_IMAGE into a "STUNNING HIGHEST-END ADVERTISING PHOTOSHOOT". Use the BRAND_LOGO asset as your ONLY reference for branding.
            
            ARTISTIC DIRECTION:
            1. ASPECT RATIO: The final image MUST be a PERFECT 1:1 SQUARE (SQUARE ASPECT RATIO). This is critical for the store's grid layout.
            2. VISUAL STYLE: Cinematic high-end advertising photography. 
            3. AUTONOMOUS SCENE SELECTION: Decide the best luxury setting (Villa, Midnight Showroom, or Hamptons Driveway).
            4. LIGHTING mastery: Professional studio lighting with realistic reflections on all surfaces.
            5. BRANDING: SEAMLESSLY and REALISTICALLY overlay the provided BRAND_LOGO onto the vehicle (number plate, side panels, or seat). It must match the perspective, lighting, and texture of the vehicle parts perfectly.
            6. QUALITY: 8k resolution textures, crystal clear focus, and professional bokeh.
            
            Output ONLY the final high-resolution square masterpiece.
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
