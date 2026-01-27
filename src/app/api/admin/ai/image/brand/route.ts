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
            ROLE: You are a World-Class Commercial Photographer and Art Director for "${BRAND_CONFIG.name}".
            
            PRODUCT: ${productName || "Premium Ride-on Vehicle"}
            
            TASK: 
            Transform the provided product image into a "STUNNING HIGHEST-END ADVERTISING PHOTOSHOOT". You have full creative autonomy to decide the absolute best setting, lighting, and composition that will make this specific product look "AMAZING" and "LUXURY".
            
            ARTISTIC DIRECTION:
            1. VISUAL STYLE: Cinematic high-end advertising photography. Think Rolex, Tesla, or Luxury Automotive brochures.
            2. AUTONOMOUS SCENE SELECTION: Decide which environment makes this product shine:
               - A "Golden Hour" sunset shoot at a modern architectural villa.
               - A high-contrast, moody "Midnight Showroom" with neon accents and marble reflections.
               - A vibrant, crisp "Hamptons Driveway" with professional landscaping and soft bokeh.
               - A futuristic "Tech-Lab" with clean lines and glowing floor panels.
            3. LIGHTING MASTERY: Use professional cinematic lighting strategies. Add dramatic rims lights, soft-box diffusion, and realistic light-wrap. Every surface (glossy plastic, chrome, rubber) must react perfectly to the environment.
            4. COMPOSITION: Use dynamic angles. Apply depth-of-field to focus on the product's craftsmanship while blurring the luxury background beautifully.
            5. BRANDING: Integrate the "${BRAND_CONFIG.name}" logo or text onto the vehicle (number plate, side trim, or seat) so perfectly it looks factory-fitted.
            6. QUALITY: Sharp focus, 8k resolution textures, zero distortion, and a "WOW" factor that makes a customer want to buy instantly.
            
            VIBE: ${BRAND_CONFIG.voice}. ${BRAND_CONFIG.tagline}.
            
            Output ONLY the final high-resolution masterpiece.
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
