import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { productName, featureText, productNotes, originalImageUrl } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const supabase = await createClient();
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        // Fetch Logo
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        // Fetch Product Image if provided
        let productBase64 = null;
        if (originalImageUrl) {
            const prodRes = await fetch(originalImageUrl);
            const prodBuffer = await prodRes.arrayBuffer();
            productBase64 = Buffer.from(prodBuffer).toString("base64");
        }

        const prompt = `
            ROLE: You are a Graphic Designer and Marketing Specialist for "${BRAND_CONFIG.name}".
            
            TASK: Create a HIGH-END "A+ CONTENT" MARKETING POSTER for the product: "${productName}".
            
            PRODUCT CONTEXT: ${productNotes || "A premium ride-on toy for children."}
            
            POSTER DIMENSIONS: 16:9 Landscape Wide Banner.
            
            CONTENT REQUIREMENTS:
            1. AUTHENTIC PRODUCT: Feature the vehicle prominently. Use the provided PRODUCT_IMAGE as the ONLY source for the car. The car's model, color, and features MUST remain 100% authentic and accurate to the photo.
            2. BRANDING: Use the provided BRAND_LOGO asset. Place it in a corner or center so it looks like an official corporate banner.
            3. MARKETING TEXT: Incorporate a punchy, high-end marketing slogan. 
               - THEME: "${featureText}"
               - SPECIFICS: Use details from the PRODUCT CONTEXT (like specific battery voltage, motor power, or luxury features) to make it highly relevant.
            4. DESIGN STYLE: Premium e-commerce marketing style (like Apple, Tesla, or Dyson). Minimalist, clean, with high-quality bold typography.
            5. BACKGROUND: A lifestyle setting that matches the product's luxury level. The car MUST look naturally integrated into this background with perfect perspective and lighting.
            6. VISUALS: Sharp focus, 8k resolution, cinematic lighting, and professional color grading.
            
            Output ONLY the final 16:9 high-resolution marketing poster.
        `;

        const inputs = [prompt, { inlineData: { data: logoBase64, mimeType: "image/png" } }];
        if (productBase64) {
            inputs.push({ inlineData: { data: productBase64, mimeType: "image/jpeg" } });
        }

        const result = await model.generateContent(inputs);
        const response = await result.response;

        const newImageBase64 = response.candidates![0].content.parts[0].inlineData!.data;
        const newImageBuffer = Buffer.from(newImageBase64, 'base64');

        const filename = `poster_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filename, newImageBuffer, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filename);

        return NextResponse.json({ success: true, posterUrl: publicUrl });

    } catch (error: any) {
        console.error("Poster Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
