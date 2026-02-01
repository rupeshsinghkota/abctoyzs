const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

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

async function listModels() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found");
        return;
    }

    // Direct fetch to list models
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name}`);
                console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
            });
        }
    } catch (error) {
        console.error("❌ Failed to list models:", error.message);
    }
}

listModels();
