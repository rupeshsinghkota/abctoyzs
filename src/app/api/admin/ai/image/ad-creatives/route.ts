import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
    try {
        const { productName, price, mrp, originalImageUrl, vibe, specs, scene: initialScene, audience: initialAudience, mode } = await req.json();

        // 0. Define Presets based on Mode
        let activeScene = initialScene || 'Urban Luxe';
        let activeAudience = initialAudience || 'Boy';
        let activeStyle: 'Minimal' | 'Poster' = 'Minimal';
        let headlineTheme = "";

        if (mode === 'celebration') {
            activeScene = 'Birthday Celebration';
            activeAudience = 'Both';
            activeStyle = 'Poster';
            headlineTheme = "Gifting / Birthday joy / The perfect surprise";
        } else if (mode === 'adventure') {
            activeScene = 'Nature Explorer';
            activeAudience = 'Both';
            activeStyle = 'Poster';
            headlineTheme = "Outdoor adventure / Exploring nature / Childhood freedom";
        } else if (mode === 'functional') {
            activeScene = 'Urban Luxe';
            activeAudience = 'No Child';
            activeStyle = 'Minimal';
        }

        // 0.1 Build Scene & Audience Prompts
        let scenePrompt = "";
        switch (activeScene) {
            case 'Nature Explorer':
                scenePrompt = "SETTING: Lush green park, forest trail, or sun-drenched garden. Natural warm sunlight filtering through trees. Earthy tones.";
                break;
            case 'Modern Minimal':
                scenePrompt = "SETTING: High-end professional studio with a clean white or light grey infinity cove. Soft, even commercial lighting. Elegant and focused.";
                break;
            case 'Twilight Ride':
                scenePrompt = "SETTING: Modern city at dusk. Ambient city lights, neon signs, and glowing storefronts. Dramatic lighting with cool blue and warm orange contrasts.";
                break;
            case 'Birthday Celebration':
                scenePrompt = "SETTING: Indoor birthday party or sunny backyard party. Vibrant balloons, confetti in the air, a wrapped gift box nearby. Celebration atmosphere.";
                break;
            case 'Urban Luxe':
            default:
                scenePrompt = "SETTING: Modern luxury home driveway or upscale city promenade. Polished concrete or clean pavement. Wealthy, aspirational urban environment.";
        }

        let audiencePrompt = "";
        switch (activeAudience) {
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
                audiencePrompt = "The product is shown alone in its environment, with NO children visible. Focus entirely on the vehicle's design and details.";
                break;
            default:
                audiencePrompt = "A happy, photogenic young child (age 3-6) naturally interacting with the vehicle.";
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
        const generateImage = async (format: 'SQUARE1' | 'SQUARE2' | 'SQUARE3') => {
            let aspectRatio: string = "1:1";
            let compositionDesc: string;

            if (format === 'SQUARE1') {
                compositionDesc = "Centered composition perfect for Instagram Feed and Facebook Ads. Product prominently in the center with text above or below.";
            } else if (format === 'SQUARE2') {
                compositionDesc = "Dynamic composition perfect for Instagram Feed and Facebook Ads. Focus on a slightly angled or low-angle perspective. Product prominently in the center.";
            } else { // SQUARE3
                compositionDesc = "Engaging lifestyle composition perfect for Instagram Feed and Facebook Ads. Product prominently in the center, showing action or fun.";
            }

            // Build a SHORT display name (strip brand prefix, keep model only)
            const shortName = productName
                .replace(/^(ABC\s*Toyz|Premium)\s*/i, '')
                .replace(/\s*(Electric|Battery|Ride[- ]?On|Kids|Children'?s?)\s*/gi, ' ')
                .trim();

            // Build the price line
            let priceSection = 'PRICE TAG: Do NOT show the price or numbers in this image. Keep it clean and focused on the product features.';

            const prompt = `Generate a professional e-commerce product ${activeStyle === 'Poster' ? 'lifestyle poster' : 'advertisement image'}.

PRODUCT: "${shortName}" — a children's ride-on toy vehicle.
Use the reference photo provided for the vehicle.

--- IMAGE LAYOUT (${format}) ---

${activeStyle === 'Poster' ? `POSTER LAYOUT:
- TOP: Small brand logo in top-left corner (sized to ~5% of width).
- MIDDLE: Emotional lifestyle hero scene.
- BOTTOM: Headline + Price + Specs on a soft dark gradient overlay.` : `MINIMAL LAYOUT:
- Clean 3-layer system with a SUBTLE logo strip at the top, hero zone in the middle, and information bar at the bottom.`}

--- CONTENT DIRECTIVES ---

LAYER 1 — TOP STRIP:
- Logo: ABC Toyz brand logo in the top-left corner. SCALE: Keep the logo small and elegant, do not let it dominate the design.
${numMrp > numPrice ? `- Sale: Tiny red "SALE" ribbon in top-right.` : ''}

LAYER 2 — HERO ZONE:
- Photorealistic scene: ${compositionDesc}
- ${scenePrompt}
- The ride-on vehicle integrated perfectly. IMPORTANT: Show the WHOLE vehicle. It must be prominent, fully centered, and NO parts of the vehicle should be cropped or cut off by the edges of the image.
- HUMAN ELEMENT: ${audiencePrompt}
${activeScene === 'Birthday Celebration' ? '- Add colorful balloons and confetti for a festive look.' : ''}

LAYER 3 — BOTTOM INFO BAR:
- Dark semi-transparent gradient overlay at the bottom.
${activeStyle === 'Poster' ? `  LINE 1: CATCHY HEADLINE — Write a short, emotional headline like "${headlineTheme || 'Premium Ride-On Toys'}" in BOLD thick white font.
  LINE 2: "${shortName}" model name in slightly smaller text.` : `  LINE 1: "${shortName}" in bold white sans-serif.`}
  LINE ${activeStyle === 'Poster' ? '3' : '2'}: ${priceSection}
${specLine ? `  LINE ${activeStyle === 'Poster' ? '4' : '3'}: Specs as pill badges: ${specLine}` : ''}
  LAST LINE: "🚚 Free Shipping  •  💳 COD Available  •  abctoyz.in"

--- TYPOGRAPHY RULES ---
- FONT: Use a modern, thick, impactful sans-serif (style: Montserrat/Bebas Neue) for headlines.
- READABILITY: All text must be 100% sharp and readable. Add subtle shadows to text if background is busy.
- Product name should be SHORT.
- NO random/gibberish characters.

--- PHOTO RULES ---
- PHOTOREALISTIC only — NO cartoon/illustration.
- Vehicle must match reference image exactly.
- Clean, premium, aspirational environment.

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
            generateImage('SQUARE1'),
            generateImage('SQUARE2'),
            generateImage('SQUARE3')
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
