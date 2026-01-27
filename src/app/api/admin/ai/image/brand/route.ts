import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";

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

        // Step 1: Download original image
        const imageRes = await fetch(imageUrl);
        const imageBuffer = await imageRes.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString("base64");

        // Step 2: Generate Branded/Enhanced Version
        const prompt = `
            ULTRA-PREMIUM IMAGE REGENERATION TASK for the brand "${BRAND_CONFIG.name}".
            
            PRODUCT: ${productName || "Luxury Ride-on Toy"}
            
            OBJECTIVE:
            Take the uploaded photo of the ride-on toy and transform it into a world-class, high-fidelity marketing asset.
            
            CRITICAL REQUIREMENTS:
            1. TOY PRESERVATION: Maintain the exact model, shape, and structure of the toy vehicle from the original image.
            2. BRANDING: Seamlessly integrate the text "${BRAND_CONFIG.name}" onto the vehicle's number plate, side panels, or windshield. It must look like a real physical sticker/part of the car, with correct perspective and reflections.
            3. LUXURY BACKGROUND: Replace any boring or factory background with a high-end setting:
               - EITHER a modern, minimalist luxury car showroom with marble floors and cinematic spotlights.
               - OR a beautiful sun-drenched private estate driveway with professional landscaping.
            4. DETIALING & TEXTURES: Dramatically enhance surface textures (glossy paint, leather seats, rubber tires, LED light clusters).
            5. LIGHTING: Use professional studio lighting (three-point setup) with soft shadows and realistic reflections.
            6. RESOLUTION: Output a crystal-clear, sharp, and high-resolution JPEG.
            7. VIBE: ${BRAND_CONFIG.voice}. ${BRAND_CONFIG.tagline}.
            
            Return ONLY the generated image data.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: "image/jpeg"
                }
            }
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
