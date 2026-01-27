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
            ROLE: You are a World-Class Commercial Retoucher and Master Colorist specializing in high-end automotive advertising for "${BRAND_CONFIG.name}".
            
            ASSETS PROVIDED:
            1. PRODUCT_IMAGE: The original photo of the vehicle.
            2. BRAND_LOGO: The official logo asset for "${BRAND_CONFIG.name}".
            
            GOAL: Enhance the PRODUCT_IMAGE into a "HIGH-IMPACT ADVERTISING MASTERPIECE" suitable for premium product pages and social media ads, WHILE PRESERVING THE ORIGINAL PRODUCT FIDELITY.
            
            CRITICAL RULES:
            1. PIXEL FIDELITY: DO NOT change the environment, background, or the vehicle's actual model/color/trim. It must remain 100% recognizable as the same car in the same location.
            2. ENHANCEMENT (MAKE IT POP): 
               - Apply professional "Color Grading" to make the colors vibrant and premium.
               - Enhance existing "Lighting & Reflections" to look like a high-end commercial shoot.
               - Optimize contrast and sharpness for "Advertising Quality".
            3. AUTHENTIC CO-BRANDING:
               - KEEP ORIGINAL CAR BRANDING: Preserve all manufacturer logos (e.g., Jeep, Ford, etc.).
               - ABC TOYZ BRANDING: Place the BRAND_LOGO asset onto the LICENSE PLATE and as a subtle, high-gloss "physical badge" on the hood or rear.
               - INTEGRATION: The logo must match the lighting, perspective, and surface texture of the vehicle so perfectly that it looks factory-fitted.
            4. QUALITY: Crystal clear 8k resolution textures, zero AI artifacts, and professional optics.
            
            Output ONLY the final breathtaking retouched masterpiece.
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
