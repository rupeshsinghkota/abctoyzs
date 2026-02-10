import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
    try {
        const { productName, price, originalImageUrl, vibe, specs } = await req.json();

        // Build spec highlights for text overlay
        const specItems: string[] = [];
        if (specs?.voltage) specItems.push(`⚡ ${specs.voltage}`);
        if (specs?.age) specItems.push(`👶 Ages ${specs.age}`);
        if (specs?.speed) specItems.push(`🏎️ ${specs.speed}`);
        if (specs?.motor) specItems.push(`🔧 ${specs.motor}`);
        if (specs?.runTime) specItems.push(`🔋 ${specs.runTime}`);
        if (specs?.maxLoad) specItems.push(`⚖️ ${specs.maxLoad}`);
        if (specs?.remoteControl) specItems.push(`🎮 Remote Control`);
        const specLine = specItems.length > 0 ? specItems.join('  |  ') : '';

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const supabase = await createClient();

        // 1. Prepare Inputs (Logo & Product Image)
        const logoPath = path.join(process.cwd(), 'public', BRAND_CONFIG.logoWide);
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString("base64");

        let productBase64: string | null = null;
        if (originalImageUrl) {
            const prodRes = await fetch(originalImageUrl);
            const prodBuffer = await prodRes.arrayBuffer();
            productBase64 = Buffer.from(prodBuffer).toString("base64");
        }

        // 2. Define Ad Generation for Each Format
        const generateImage = async (format: 'SQUARE' | 'STORY' | 'LANDSCAPE') => {
            let aspectRatio: string;
            let compositionDesc: string;

            if (format === 'SQUARE') {
                aspectRatio = "1:1";
                compositionDesc = "Centered composition perfect for Instagram Feed and Facebook Ads. Product prominently in the center with text above or below.";
            } else if (format === 'STORY') {
                aspectRatio = "9:16";
                compositionDesc = "Full-screen vertical composition for Instagram Stories and Reels. Product in the lower-middle third. Leave the TOP 30% clear for platform UI elements. Immersive environment extending to all edges.";
            } else { // LANDSCAPE
                aspectRatio = "16:9";
                compositionDesc = "Cinematic wide-angle composition for Facebook Feed and Audience Network. Product positioned on the right side with generous negative space on the left for text overlay.";
            }

            const prompt = `You are a World-Class Automotive Advertising Director at a top creative agency.
Create a MASTERPIECE advertising image for a premium children's ride-on vehicle called "${productName}".

COMPOSITION DIRECTIVE:
${compositionDesc}

PHOTOGRAPHIC STYLE (MANDATORY):
- Camera: Shot on Canon EOS R5, 35mm lens, f/2.8 aperture
- Lighting: Golden hour natural light with subtle rim lighting on the vehicle
- Quality: Ultra-sharp, 8K photorealistic, hyper-detailed textures
- Depth: Shallow depth of field with creamy bokeh background
- Color: Rich, warm color palette with high dynamic range
- Post: Professional color grading, subtle lens flare

SCENE & ENVIRONMENT:
- Setting: Luxury modern home driveway, manicured lawn, or upscale park setting
- Surface: Clean concrete, polished asphalt, or lush green grass
- Background: Soft-focus upscale neighborhood, trees with golden light filtering through
- Atmosphere: Aspirational, premium lifestyle, warm and inviting

HERO SUBJECT (THE VEHICLE):
- The ride-on vehicle from the reference image — MUST MATCH EXACTLY
- Perfect integration into the scene with correct shadows, reflections, and lighting
- Glossy plastic finish catching natural light highlights
- Chrome/metallic accents reflecting environment realistically
- Wheels grounded naturally on the surface

HUMAN ELEMENT:
- A happy, photogenic child (age 3-7) naturally interacting with or riding the vehicle
- Genuine joy and excitement on their face
- Natural pose — not stiff or awkward
- Appropriate clothing (casual premium — think Gap Kids or Zara Kids)

TYPOGRAPHY & BRANDING:
- HEADLINE: Product name "${productName}" displayed prominently in bold, clean sans-serif white text
- Price badge: Clean, modern "Only ₹${price}" in a sleek pill-shaped badge
${specLine ? `- SPEC STRIP: Show these key specs as small feature icons/badges beneath the headline:
  ${specLine}
  Use small pill-shaped badges with icons, arranged horizontally. Clean, modern, minimal design.` : ''}
- Font: San-serif, bold, white text on a semi-transparent dark background
- Position: Lower-right corner for Square, lower-center for Story, left side for Landscape
- NO gibberish text, NO distorted letters — must be perfectly readable

STRICT CONSTRAINTS (DO NOT VIOLATE):
- PHOTOREALISTIC ONLY — absolutely no cartoon, illustration, or painterly style
- NO distorted faces, extra limbs, or uncanny valley effects on the child
- NO extra wheels, missing parts, or deformed vehicle components
- NO cropping of the main vehicle — keep it FULLY visible in frame
- NO cluttered or busy backgrounds — keep it clean and premium
- NO watermarks other than subtle brand placement

VIBE: ${vibe || "Premium Luxury, Aspirational, Clean, Modern"}.`;

            // Build content parts
            const contents: any[] = [
                { text: prompt },
                { inlineData: { data: logoBase64, mimeType: "image/png" } }
            ];
            if (productBase64) {
                contents.push({ inlineData: { data: productBase64, mimeType: "image/jpeg" } });
            }

            // Use new SDK with ALL capabilities
            const response = await ai.models.generateContent({
                model: "gemini-3-pro-image-preview",
                contents: contents,
                config: {
                    responseModalities: ["Image"],
                    imageConfig: {
                        aspectRatio: aspectRatio as any,
                    },
                },
            });

            // Extract image from response
            const candidate = response.candidates?.[0];
            if (!candidate?.content?.parts) {
                throw new Error(`Failed to generate ${format} image — no candidates returned`);
            }

            // Find the image part in the response
            let imageData: string | null = null;
            for (const part of candidate.content.parts) {
                if (part.inlineData?.data) {
                    imageData = part.inlineData.data;
                    break;
                }
            }

            if (!imageData) {
                throw new Error(`Failed to generate ${format} image — no image data in response`);
            }

            const buffer = Buffer.from(imageData, 'base64');
            const filename = `ad_creative_${format.toLowerCase()}_${Date.now()}.png`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filename, buffer, { contentType: 'image/png' });

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
