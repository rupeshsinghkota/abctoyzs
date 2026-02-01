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
        // 3. STEP 1: ANALYST (Gemini 2.0 Flash) or SCENE OVERRIDE
        let generatedPrompt = "";
        let generatedScene = payload.sceneOverride || "";

        if (generatedScene) {
            console.log(`[AI] Using scene override: "${generatedScene.substring(0, 50)}..."`);
            // We don't have product details when overriding, so we rely on general instruction
            generatedPrompt = `Commercial product photography of ${productName} in ${generatedScene}. The view is identical to the original input. The license plate reads 'ABC TOYZ'. Preserve all product details.`;
        } else {
            // "Think" about the best background and description
            // Using gemini-2.0-flash as it was verified to work in scripts/verify-2step.js
            const analystModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const analystPrompt = `You are an expert visual describer.
            Analyze the input image of the product "${productName}".
            
            YOUR TASK:
            1. Analyze the product's key visual details (color, type, specific features).
            2. Decide the SINGLE BEST commercial background scene for it.
            3. Output a 2-part description separated by a pipe symbol "|".
            
            Format: [SCENE DESCRIPTION] | [PRODUCT DETAILS]
            
            Example Output:
            "a luxury modern driveway with sleek concrete walls" | "a red sports car with a black spoiler and silver rims"
            
            CRITICAL:
            - NO introductory text.
            - STRICTLY follow the "Scene | Product" format.
            `;

            try {
                console.log(`[AI] Step 1: Analyst thinking about scene & details...`);
                // Use JSON mode to force clean output if possible, or just strict prompt
                const analystResult = await analystModel.generateContent([
                    analystPrompt,
                    { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
                ]);
                const rawResult = analystResult.response.text().trim().replace(/^"|"$/g, '');

                const parts = rawResult.split('|');
                generatedScene = parts[0]?.trim() || "a professional studio";
                const productDetails = parts[1]?.trim() || productName;

                console.log(`[AI] Step 1 Result: Scene="${generatedScene.substring(0, 20)}..." Details="${productDetails.substring(0, 20)}..."`);

                // Enforce extraction + preservation
                generatedPrompt = `Commercial product photography of ${productDetails} in ${generatedScene}. The view is identical to the original input. The license plate reads 'ABC TOYZ'. Preserve all original details exactly.`;
            } catch (e: any) {
                console.error(`[AI] Step 1 failed: ${e.message}`);
                console.log(`[AI] Analyst failed, falling back to static prompt.`);
                generatedScene = "a professional modern studio with soft lighting";
                generatedPrompt = `Commercial product photography of ${productName}. The product has an "ABC TOYZ" license plate. High quality, 8k resolution.`;
            }
        }

        const contentParts: any[] = [
            { text: generatedPrompt },
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ];

        if (logoBase64) {
            contentParts.push({ text: "BRAND LOGO:" }, { inlineData: { data: logoBase64, mimeType: "image/png" } });
        }

        // 4. STEP 2: ARTIST (Gemini 3 Pro)
        console.log(`[AI] Step 2: Artist creating with gemini-3-pro-image-preview...`);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            generationConfig: { temperature: 0.1, topP: 0.95 },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        }, { timeout: 120000 });

        const result = await model.generateContent(contentParts);
        const response = await result.response;

        let resultImageBase64 = null;
        if (response.candidates && response.candidates[0].content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if ((part as any).inlineData?.data) {
                    resultImageBase64 = (part as any).inlineData.data;
                    break;
                }
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
            newImageUrls: [publicUrl],
            generatedScene: generatedScene // Return scene for frontend reuse
        });

    } catch (error: any) {
        console.error("[AI-CRITICAL] Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
    }
}
