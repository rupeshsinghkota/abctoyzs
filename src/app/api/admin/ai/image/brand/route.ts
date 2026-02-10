import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, FunctionCallingMode } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHeroScene } from "@/config/ai-scenes";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const maxDuration = 300; // 5 minute timeout

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        // Use either imageUrl or the first from imageUrls to be safe
        let sourceImageUrl = payload.imageUrl;
        if (!sourceImageUrl && payload.imageUrls && Array.isArray(payload.imageUrls)) {
            sourceImageUrl = payload.imageUrls[0];
        }

        const productName = payload.productName || "Product";

        if (!sourceImageUrl) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        console.log(`[AI] Processing target image for: ${productName}`);

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY is missing" }, { status: 500 });
        }

        const supabase = await createClient();

        // 1. Fetch Source Image
        const imageResp = await fetch(sourceImageUrl);
        if (!imageResp.ok) throw new Error("Failed to fetch source image");
        const imageBuffer = await imageResp.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        // 2. Fetch Logo (optional)
        let logoBase64 = "";
        try {
            const logoResp = await fetch("https://abctoyzs.vercel.app/images/logo.png");
            if (logoResp.ok) {
                const buffer = await logoResp.arrayBuffer();
                logoBase64 = Buffer.from(buffer).toString("base64");
            }
        } catch (e) {
            console.warn("Logo fetch failed, proceeding without logo");
        }

        // ---------------------------------------------------------
        // STAGE 1: THE ANALYST (CLASSIFIER) - Returns JSON
        // ---------------------------------------------------------
        let analysisData: any = {};
        let generatedScene = payload.sceneOverride || "";
        // Logic: If sceneOverride exists, we might still want to analyze for 'part detection' 
        // but strictly speaking, if it's an infographic, we ignore the scene anyway.

        const analystModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" } // Force JSON
        });

        const analystPrompt = `
        You are an AI Visual Analyst for a toy store. 
        Analyze the TARGET IMAGE of "${productName}".
        
        Output a STRICT JSON object with this schema:
        {
            "category": "MAIN_PRODUCT" | "DETAIL_PART" | "INFOGRAPHIC",
            "visual_details": "string (Extremely detailed: rims style, headlight shape, grille pattern, stickers, exact body contours)",
            "view_angle": "string (e.g. 'Front View', 'Side Profile', '3/4 Rear View', 'Top Down')",
            "text_content": ["list", "of", "readable", "text", "on", "image"],
            "branding_to_remove": ["list", "of", "competitor", "logos", "corner_icons"],
            "suggested_scene": "string (creative background scene if it's a MAIN_PRODUCT)",
            "lighting_mood": "string (e.g. 'Golden Hour', 'Cyberpunk Neon', 'Soft Studio')"
        }

        RULES:
        - "category": If image has explanatory text, arrows, dimensions, or list of features -> MUST be "INFOGRAPHIC". Only use "DETAIL_PART" for clean, text-free close-ups.
        - "view_angle": CRITICAL. Identify the exact camera angle (e.g. "Front Facing", "Side Profile").
        - "text_content": CAREFULLY READ all specs/labels.
        - "suggested_scene": If MAIN_PRODUCT, invent a majestic scene.
        - "lighting_mood": Match the vibe of the product.
        `;

        const analystParts: any[] = [
            { text: analystPrompt },
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ];

        // Add context images for shape reference if available
        if (payload.imageUrls && Array.isArray(payload.imageUrls) && payload.imageUrls.length > 0) {
            const otherImages = payload.imageUrls.filter((url: string) => url !== sourceImageUrl).slice(0, 3);
            if (otherImages.length > 0) {
                const contextBuffers = await Promise.all(otherImages.map(async (url: string) => {
                    try { return (await fetch(url)).ok ? await (await fetch(url)).arrayBuffer() : null; } catch (e) { return null; }
                }));
                contextBuffers.forEach(buf => {
                    if (buf) analystParts.push({ inlineData: { data: Buffer.from(buf).toString('base64'), mimeType: "image/jpeg" } });
                });
            }
        }

        try {
            console.log(`[AI] Stage 1: Analyst classifying...`);
            const analystResult = await analystModel.generateContent(analystParts);
            analysisData = JSON.parse(analystResult.response.text());

            // FIX: Handle case where AI analyzes ALL context images and returns an array
            if (Array.isArray(analysisData)) {
                console.log(`[AI] Analyst returned array of ${analysisData.length}, using first item (Target).`);
                analysisData = analysisData.length > 0 ? analysisData[0] : {};
            }

            // SAFETY: Ensure category exists
            if (!analysisData?.category) {
                console.warn("[AI] Warning: Analyst returned no category. Defaulting to MAIN_PRODUCT.");
                analysisData = { ...analysisData, category: "MAIN_PRODUCT" };
            }

            console.log(`[AI] Stage 1 Result:`, JSON.stringify(analysisData));
        } catch (e: any) {
            console.error(`[AI] Stage 1 Failed: ${e.message}. Defaulting to MAIN_PRODUCT.`);
            analysisData = { category: "MAIN_PRODUCT", visual_details: productName, branding_to_remove: [], suggested_scene: "Professional Studio" };
        }

        // ---------------------------------------------------------
        // STAGE 2: THE ROUTER (LOGIC)
        // ---------------------------------------------------------
        let artistPrompt = "";

        // Scene Logic: Override > Analyst > Default
        // BUT: If it's Part/Infographic, we IGNORE the override to preserve quality.
        if (analysisData.category === "MAIN_PRODUCT") {
            generatedScene = payload.sceneOverride || analysisData.suggested_scene || "a professional studio";
        } else {
            console.log(`[AI] Router: Ignoring Master Scene because category is ${analysisData.category}`);
            generatedScene = "a clean, neutral studio background"; // Forced neutral for parts/text
        }

        const details = analysisData.visual_details || productName;
        const removeList = (analysisData.branding_to_remove || []).join(", ");
        const textToKeep = (analysisData.text_content || []).join(", ");
        const lighting = analysisData.lighting_mood || "Cinematic Lighting";
        const angle = analysisData.view_angle || "matching the original angle";

        // ---------------------------------------------------------
        // STAGE 3: SPECIALIZED EXECUTION (ARTIST)
        // ---------------------------------------------------------
        if (analysisData.category === "INFOGRAPHIC") {
            // STRATEGY: CLEANUP & PRESERVE
            artistPrompt = `High-resolution reproduction of this product infographic. Preserve strictly all technical lines, diagrams, measurement markers, and fine details. All extracted text (specifically: [${textToKeep}]) appears crisp and legible. CRITICAL: The final image must be a strict Square (1:1) aspect ratio. If the original is not square, extend the background. Do not crop, rotate, or alter the color of any element. The content must be an exact replica of the original. The background is a clean, neutral professional surface. The image is devoid of third-party logos like [${removeList}, 'JN Creations'].`;
        }
        else if (analysisData.category === "DETAIL_PART") {
            // STRATEGY: MACRO STUDIO
            artistPrompt = `Macro photography close-up of ${details}. High-end studio photography with soft depth of field and ${lighting}. A clean, neutral, soft-focus studio background. CRITICAL: Output image must be a strict Square (1:1) aspect ratio. The subject is shown in a strict ${angle} identical to the input. Do not rotate the object. The image is pristine and does not contain watermarks or logos like [${removeList}].`;
        }
        else {
            // STRATEGY: MAIN PRODUCT SCENIC (Default)
            artistPrompt = `Commercial product photography of ${details} placed in ${generatedScene}. CRITICAL: Output image must be a strict Square (1:1) aspect ratio. The product is shown in a strict ${angle} identical to the input. You must PRESERVE the exact COLOR, shape, rims, headlights, and body lines of the original car. Do not "hallucinate" a new model or change the product's hue. Lighting is ${lighting}. The license plate reads 'ABC Toyz'. The composition is clean and technically perfect, without floating watermarks or logos like [${removeList}, 'JN Creations']. 8k resolution.`;
        }

        console.log(`[AI] Stage 3: Artist executing prompt for [${analysisData.category}]...`);

        const artistModel = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            // FORCE DISABLE FUNCTION CALLING
            toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
            generationConfig: { temperature: 0.1, topP: 0.95 },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        }, { timeout: 120000 });

        const contentParts: any[] = [
            { text: artistPrompt },
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ];

        if (logoBase64 && analysisData.category === "MAIN_PRODUCT") {
            // Only add ABC Toyz logo for main shots, not details/infographics (might clutter)
            contentParts.push({ text: "Apply this logo to the image if suitable:" }, { inlineData: { data: logoBase64, mimeType: "image/png" } });
        }

        const result = await artistModel.generateContent(contentParts);
        const response = await result.response;

        if (response.candidates?.[0]?.safetyRatings) {
            console.log("[AI] Safety Ratings:", JSON.stringify(response.candidates[0].safetyRatings));
        }

        let resultImageBase64 = null;
        if (response.candidates && response.candidates[0].content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if ((part as any).inlineData?.data) {
                    resultImageBase64 = (part as any).inlineData.data;
                    break;
                }
            }
        }

        if (!resultImageBase64) {
            const failureReason = response.candidates?.[0]?.finishReason || "UNKNOWN";
            const safety = JSON.stringify(response.promptFeedback);
            console.error(`[AI-CRITICAL] Generation Failed. Reason: ${failureReason}. Safety: ${safety}`);
            throw new Error(`AI failed to generate image. Blocked by: ${failureReason}`);
        }

        // 5. UPLOAD TO SUPABASE
        const newImageBuffer = Buffer.from(resultImageBase64, 'base64');
        const fileName = `enhanced_${productName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, newImageBuffer, { contentType: 'image/png', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            newImageUrl: publicUrl,
            newImageUrls: [publicUrl],
            generatedScene: generatedScene,
            analysis: analysisData // Return analysis for debug
        });

    } catch (error: any) {
        console.error("[AI-CRITICAL] Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
    }
}
