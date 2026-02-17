// import 'dotenv/config';

const apiKey = process.env.MSG91_AUTH_KEY;
const sender = process.env.MSG91_SENDER_NUMBER || process.env.MSG91_INTEGRATED_NUMBER;
const templateId = process.env.MSG91_OTP_TEMPLATE_ID || 'auth_abctoyz';
const to = '919876543210';

console.log("Configuration:");
console.log("Sender:", sender);
console.log("Template:", templateId);
console.log("To:", to);

async function testPayload(name, payload) {
    console.log(`\n--- Testing ${name} ---`);
    const url = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "authkey": apiKey,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function run() {
    if (!apiKey || !sender) {
        console.error("Missing credentials");
        return;
    }

    // 4. Nested Simple with Variables (Does MSG91 support this?)
    await testPayload("Nested Variables in Template", {
        integrated_number: sender,
        content_type: "template",
        payload: {
            to: to,
            type: "template",
            template: {
                name: templateId,
                language: { code: "en", policy: "deterministic" },
                variables: { "1": "123456" }
            }
        }
    });

    // 5. Nested Payload Root Variables (Likely candidate for simple API)
    await testPayload("Nested Variables in Payload Root", {
        integrated_number: sender,
        content_type: "template",
        payload: {
            template_id: templateId, // or name
            to: to,
            variables: { "1": "123456" } // Try numeric key
        }
    });

}

run();
