
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Load Env
const envPath = path.resolve(process.cwd(), ".env.local");
const envFile = fs.readFileSync(envPath, "utf8");
const envVars = envFile.split("\n").reduce((acc, line) => {
    const [key, value] = line.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});

const apiKey = envVars.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No Gemini API Key found in .env.local");
    process.exit(1);
}

console.log("Testing Gemini API with key ending in...", apiKey.slice(-4));

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function run() {
    try {
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("SUCCESS: Gemini API is working.");
    } catch (error) {
        console.error("FAILURE: Gemini API Error:", error.message);
    }
}

run();
