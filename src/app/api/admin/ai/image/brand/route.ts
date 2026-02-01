import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
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

        // 3. Prepare AI Interaction
        const scene = getHeroScene();
        const prompt = `COMMERCIAL PHOTO RETOUCHING TASK:
- PRODUCT: ${productName}
- SCENE: ${scene.description}.
- LIGHTING: ${scene.lighting}
- STYLE: Automotive Commercial.

STRICT RULES:
1. KEEP SUBJECT IDENTICAL (Size, Shape, Color).
2. REMOVE SELLER WATERMARKS/OVERLAYS.
3. REPLACE BACKGROUND with the scene above.
4. QUALITY: 8K, Photorealistic.
5. LICENSE PLATE: "ABC TOYZ".`;

        const contentParts: any[] = [
            { text: prompt },
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ];

        if (logoBase64) {
            contentParts.push({ text: "BRAND LOGO:" }, { inlineData: { data: logoBase64, mimeType: "image/png" } });
        }

        // 4. GENERATION with FALLBACK
        let resultImageBase64 = null;
        const modelsToTry = ["gemini-3-pro-image-preview", "gemini-1.5-flash"];

        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI] Attempting generation with ${modelName}...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { temperature: 0.1, topP: 0.95 },
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ]
                }, { timeout: 120000 }); // 2 min timeout per model

                const result = await model.generateContent(contentParts);
                const response = await result.response;

                if (response.candidates && response.candidates[0].content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if ((part as any).inlineData?.data) {
                            resultImageBase64 = (part as any).inlineData.data;
                            break;
                        }
                    }
                }

                if (resultImageBase64) {
                    console.log(`[AI] Success with ${modelName}!`);
                    break;
                }
            } catch (err: any) {
                console.error(`[AI] ${modelName} failed:`, err.message);
                if (modelName === modelsToTry[modelsToTry.length - 1]) throw err;
                console.log(`[AI] Retrying with fallback model...`);
            }
        }

        if (!resultImageBase64) throw new Error("AI failed to generate an image part");

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
            newImageUrls: [publicUrl] // Compatibility with frontend loops
        });

    } catch (error: any) {
        console.error("[AI-CRITICAL] Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
    }
}
