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

    const prompt = `Commercial product photography of ${productName} in a ${scene.description}. ${scene.lighting}. ${scene.style} style. High quality, 8k.`;

    const contentParts = [
        { text: prompt },
        { inlineData: { data: imageBase64, mimeType: "image/png" } }
    ];

    // Fallback Logic Removed - Strictly Gemini 3 Pro
    const modelName = "gemini-3-pro-image-preview";
    let resultImageBase64 = null;

    console.log("\n[TEST] Starting Generation Sequence...");
    console.log(`[TEST] Attempting generation with ${modelName}...`);

    try {
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
        } else {
            console.error("❌ [FAIL] No image data in response.");
            if (response.candidates && response.candidates.length > 0) {
                console.log("Candidate Finish Reason:", response.candidates[0].finishReason);
                try {
                    console.log("Response Text:", response.text());
                } catch (e) {
                    console.log("No text content.");
                }
                console.log("Full Parts:", JSON.stringify(response.candidates[0].content?.parts, null, 2));
            } else {
                console.log("No candidates returned.");
                console.log("PromptFeedback:", JSON.stringify(response.promptFeedback, null, 2));
            }
        }

    } catch (err) {
        console.error(`❌ [FAIL] ${modelName} failed:`, err.message);
    }
}

testGeneration();
