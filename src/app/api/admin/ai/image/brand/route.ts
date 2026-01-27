import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
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

        // Using the verified model for image generation with relaxed safety for commercial use
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        });

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
            ROLE: You are the world's most elite Commercial Photographer and Digital Artist specializing in high-end automotive advertising for "${BRAND_CONFIG.name}".
            
            ASSETS PROVIDED:
            1. PRODUCT_IMAGE: The original photo of the vehicle.
            2. BRAND_LOGO: The official logo asset for "${BRAND_CONFIG.name}".
            
            GOAL: Transform the PRODUCT_IMAGE into an "AMAZING PREMIUM PRODUCT PAGE (PDP) MASTERPIECE". Enhance the entire shot—including high-end background replacement and cinematic lighting—while preserving 100% fidelity to the specific car model provided.
            
            CRITICAL WORKFLOW:
            1. PRODUCT FIDELITY: The vehicle's model, color, and specific features MUST remain 100% authentic to the PRODUCT_IMAGE. Do not transform the car into a different model.
            2. ENVIRONMENT & SHOT ENHANCEMENT:
               - Create a "STUNNING, BETTER BACKGROUND" that matches the vehicle's luxe level (e.g., modern architectural driveway, desert landscape at golden hour, or a high-tech studio).
               - Optimize the "SHOT DIRECTION" and composition to make it look like a professional HERO SHOT. 
               - Enhance "Specular Highlights", reflections, and professional color grading to make the image "POP".
            3. DYNAMIC ABC TOYZ BRANDING:
               - INTELLIGENT PLACEMENT: Identify the visible surfaces of the vehicle and place the BRAND_LOGO asset where it looks most natural:
                 - If the FRONT is visible: Place on the LICENSE PLATE.
                 - If the REAR is visible: Place on the LICENSE PLATE or TRUNK.
                 - If the SIDE is visible: Place as a small, elegant badge on the DOOR or as a center-cap on the WHEELS.
                 - If the HOOD is visible: Place as a subtle, high-gloss "physical badge".
               - INTEGRATION: The logo must follow the car's perspective, curvature, and lighting perfectly so that it looks factory-fitted, regardless of the camera angle.
            4. CLEANING:
               - REMOVE OTHER SELLER BRANDING: surgically remove any watermarks, generic toy shop logos, or retailer text from the original photo.
               - PRESERVE CAR IDENTITY: DO NOT remove authentic car manufacturer logos (e.g., Jeep, Ford, Mercedes, BMW badges).
            
            Output ONLY the final breathtaking 1:1 SQUARE masterpiece that respects the original camera direction while maximizing "Commercial Appeal".
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
            { inlineData: { data: logoBase64, mimeType: "image/png" } }
        ]);

        const response = await result.response;

        // Robust check for response candidates
        if (!response.candidates || response.candidates.length === 0) {
            // Check if it was blocked by safety filters
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                console.error("AI Generation Blocked:", blockReason, response.promptFeedback);
                throw new Error(`AI generation was blocked by safety filters: ${blockReason}. Please try a different product image.`);
            }

            console.error("Gemini Response Error (No Candidates):", JSON.stringify(response, null, 2));
            throw new Error("The AI failed to generate an image. This can happen due to specialized lighting or complex backgrounds. Please try again or use a different photo.");
        }

        const candidate = response.candidates[0];

        // Check for finish reason (e.g., SAFETY, RECITATION)
        if (candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS" && !candidate.content?.parts?.[0]?.inlineData) {
            console.error("Generation Stopped Prematurely:", candidate.finishReason, candidate.safetyRatings);
            throw new Error(`AI generation stopped unexpectedly (${candidate.finishReason}). This is usually due to safety filters or image complexity.`);
        }

        if (!candidate.content?.parts?.[0]?.inlineData) {
            console.error("Incomplete Response Part:", JSON.stringify(candidate, null, 2));
            throw new Error("The AI returned an partial response without image data. Please try again.");
        }

        const newImageBase64 = candidate.content.parts[0].inlineData.data;
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
