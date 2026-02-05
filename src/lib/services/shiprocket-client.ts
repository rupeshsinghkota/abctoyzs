import crypto from 'crypto';

const SHIPROCKET_API_BASE = 'https://checkout-api.shiprocket.com'; // Verified Production Endpoint for Checkout

export class ShiprocketClient {
    private apiKey: string;
    private apiSecret: string;

    constructor() {
        this.apiKey = (process.env.SHIPROCKET_API_KEY || '').trim();
        this.apiSecret = (process.env.SHIPROCKET_API_SECRET || '').trim();

        if (!this.apiKey || !this.apiSecret) {
            console.warn("⚠️ Shiprocket Credentials credentials missing in environment variables.");
        }
    }

    private generateHmac(payloadString: string): string {
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(payloadString)
            .digest('base64');
    }

    async post(endpoint: string, data: any) {
        // Critical: Stringify once to ensure Body and HMAC payload are identical
        const payloadString = JSON.stringify(data);
        const hmac = this.generateHmac(payloadString);
        const url = `${SHIPROCKET_API_BASE}${endpoint}`;

        console.log(`[Shiprocket] POST ${url}`);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.apiKey,
                    'X-Api-HMAC-SHA256': hmac
                },
                body: payloadString
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Shiprocket] Error ${response.status}:`, errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || errorJson.error || `API Error: ${response.status}`);
                } catch (e) {
                    throw new Error(`Shiprocket API Failed: ${response.status} - ${errorText}`);
                }
            }

            return await response.json();
        } catch (error) {
            console.error("[Shiprocket] Request Failed:", error);
            throw error;
        }
    }
}
