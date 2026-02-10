import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
    try {
        const { productName, price, mrp, originalImageUrl, vibe, specs, scene, audience } = await req.json();

        // 0. Build Scene & Audience Prompts
        let scenePrompt = "";
        switch (scene) {
            case 'Nature Explorer':
                scenePrompt = "SETTING: Lush green park, forest trail, or sun-drenched garden. Natural warm sunlight filtering through trees. Earthy tones.";
                break;
            case 'Modern Minimal':
                scenePrompt = "SETTING: High-end professional studio with a clean white or light grey infinity cove. Soft, even commercial lighting. Elegant and focused.";
                break;
            case 'Twilight Ride':
                scenePrompt = "SETTING: Modern city at dusk. Ambient city lights, neon signs, and glowing storefronts. Dramatic lighting with cool blue and warm orange contrasts.";
                break;
            case 'Urban Luxe':
            default:
                scenePrompt = "SETTING: Modern luxury home driveway or upscale city promenade. Polished concrete or clean pavement. Wealthy, aspirational urban environment.";
        }

        let audiencePrompt = "";
        switch (audience) {
            case 'Boy':
                audiencePrompt = "A happy, photogenic young boy (age 3-6) riding or playing with the vehicle.";
                break;
            case 'Girl':
                audiencePrompt = "A happy, photogenic young girl (age 3-6) riding or playing with the vehicle.";
                break;
            case 'Both':
                audiencePrompt = "Two happy young children (a boy and a girl, age 3-6) playing together with the vehicle.";
                break;
            case 'No Child':
            default:
                audiencePrompt = "The product is shown alone in its environment, with NO children visible. Focus entirely on the vehicle's design and details.";
        }

        // Build spec highlights for text overlay — filter out empty/N/A values
        const isValid = (v: any) => v && String(v).trim() !== '' && String(v).toLowerCase() !== 'n/a' && String(v).toLowerCase() !== 'na';
        const specItems: string[] = [];
        if (isValid(specs?.voltage)) specItems.push(`⚡ ${specs.voltage}`);
        if (isValid(specs?.age)) specItems.push(`👶 ${specs.age} Yrs`);
        if (isValid(specs?.speed)) specItems.push(`🏎️ ${specs.speed}`);
        if (isValid(specs?.motor)) specItems.push(`🔧 ${specs.motor}`);
        if (isValid(specs?.runTime)) specItems.push(`🔋 ${specs.runTime}`);
        if (isValid(specs?.maxLoad)) specItems.push(`⚖️ ${specs.maxLoad}`);
        if (specs?.remoteControl) specItems.push(`🎮 Remote`);
        // Keep max 4 specs to avoid clutter
        const specLine = specItems.slice(0, 4).join('  •  ');

        // Calculate discount
        const numPrice = Number(price) || 0;
        const numMrp = Number(mrp) || 0;
        const discount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;
        const savings = numMrp > numPrice ? numMrp - numPrice : 0;

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

            // Build a SHORT display name (strip brand prefix, keep model only)
            const shortName = productName
                .replace(/^(ABC\s*Toyz|Premium)\s*/i, '')
                .replace(/\s*(Electric|Battery|Ride[- ]?On|Kids|Children'?s?)\s*/gi, ' ')
                .trim();

            // Build the price line
            let priceText = `₹${numPrice.toLocaleString('en-IN')}`;
            let priceSection = `PRICE TAG: Show "${priceText}" in large bold white text inside a dark rounded pill badge.`;
            if (numMrp > numPrice) {
                priceSection += `
  Next to it show "₹${numMrp.toLocaleString('en-IN')}" in smaller grey text with a strikethrough line.
  Above or near the price, add a RED circular starburst badge with "${discount}% OFF" in bold white text — like a retail sale sticker.`;
            }

            const prompt = `Generate a professional e-commerce product advertisement image.

PRODUCT: "${shortName}" — a children's ride-on toy vehicle.
Use the reference product photo provided to accurately depict the vehicle.

--- IMAGE LAYOUT (${format} — ${aspectRatio}) ---

The image has 3 visual layers from top to bottom:

LAYER 1 — TOP STRIP (8% height):
- A thin semi-transparent dark overlay strip across the top
- LEFT side: ABC Toyz brand logo (use the provided logo image), small and white
${numMrp > numPrice ? `- RIGHT side: Small red diagonal "SALE" ribbon badge` : ''}

LAYER 2 — HERO ZONE (60% height):
- Photorealistic scene: ${compositionDesc}
- ${scenePrompt}
- The ride-on vehicle on the specified surface, integrated perfectly with shadows and reflections.
- HUMAN ELEMENT: ${audiencePrompt}
- Lighting matching the setting (Golden hour, Studio, or Twilight).
- Camera: 35mm, f/2.8, eye-level or slightly low angle
- KEEP THIS AREA MOSTLY VISUAL — minimal to no text here

LAYER 3 — BOTTOM INFO BAR (30% height):
- Dark semi-transparent gradient overlay (black at 70-80% opacity)
- All text goes HERE, neatly arranged:

  LINE 1: "${shortName}" — product name in bold white sans-serif, 1 line max, medium size
  LINE 2: ${priceSection}
${specLine ? `  LINE 3: Spec highlights as a single row of tiny pill badges:
  ${specLine}` : ''}
${numMrp > numPrice ? `  LINE 4: "Save ₹${savings.toLocaleString('en-IN')}" in small green text` : ''}
  LAST LINE: "🚚 Free Shipping  •  💳 COD Available  •  abctoyz.in" in very small white/grey text at the bottom edge

--- TEXT RULES ---
- ALL text must be sharp, clean, and PERFECTLY READABLE — no blur, no distortion
- Use only simple sans-serif font (like Helvetica or Arial)
- Keep text SHORT — abbreviate if needed. Never let text wrap more than 1 line
- Product name should be SHORT, not the full database name
- NO random/gibberish characters anywhere

--- PHOTO RULES ---
- PHOTOREALISTIC only — NO cartoon, illustration, or painting style
- Vehicle must match the reference image exactly (color, shape, design)
- No extra wheels, deformed parts, or missing components
- No distorted human faces or anatomy
- Clean, uncluttered background

VIBE: ${vibe || "Premium, Aspirational, Clean, Modern"}.`;

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
