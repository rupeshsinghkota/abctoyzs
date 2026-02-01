const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Mock Env
function getApiKey() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        return match ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
}

async function testGeneration() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env.local");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // Mock Payload
    const productName = "Test Product";
    const imagePath = path.join(__dirname, '..', 'public', 'logo.png');

    console.log(`[TEST] Reading test image: ${imagePath}`);
    let imageBase64;
    try {
        imageBase64 = fs.readFileSync(imagePath).toString('base64');
    } catch (e) {
        console.error("❌ Test image not found. Please ensure public/logo.png exists.");
        return;
    }

    // Mock dynamic scene for test
    const scene = { description: "Modern Studio", lighting: "Soft Studio Lighting", style: "Minimalist" };

    // Reverting to minimal safe prompt to avoid crashes
    const prompt = `Commercial product photography of ${productName} in a ${scene.description}. High quality.`;

    const contentParts = [
        { text: prompt },
        { inlineData: { data: imageBase64, mimeType: "image/png" } }
    ];

    // Fallback Logic Reinstated
    const modelsToTry = ["gemini-3-pro-image-preview", "gemini-2.0-flash"];
    let resultImageBase64 = null;

    console.log("\n[TEST] Starting Generation Sequence...");

    for (const modelName of modelsToTry) {
        try {
            console.log(`[TEST] Attempting generation with ${modelName}...`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0.1, topP: 0.95 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            }, { timeout: 120000 });

            const result = await model.generateContent(contentParts);
            const response = await result.response;

            if (response.candidates && response.candidates[0].content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData?.data) {
                        resultImageBase64 = part.inlineData.data;
                        break;
                    }
                }
            }

            if (resultImageBase64) {
                console.log(`✅ [SUCCESS] Generated image using ${modelName}!`);
                fs.writeFileSync(path.join(__dirname, 'test_output.png'), Buffer.from(resultImageBase64, 'base64'));
                console.log(`[TEST] Saved result to scripts/test_output.png`);
                break;
            }
        } catch (err) {
            console.error(`❌ [FAIL] ${modelName} failed:`, err.message);
            console.log(`[TEST] Retrying with fallback model...`);
        }
    }

    if (!resultImageBase64) {
        console.error("❌ [CRITICAL] All models failed.");
    }
}

testGeneration();
