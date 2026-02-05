import crypto from 'crypto';

const SHIPROCKET_API_BASE = 'https://checkout-api.shiprocket.com'; // Production
// const SHIPROCKET_API_BASE = 'https://fastrr-api-dev.pickrr.com'; // Staging

export class ShiprocketClient {
    private apiKey: string;
    private apiSecret: string;

    constructor() {
        this.apiKey = (process.env.SHIPROCKET_API_KEY || '').trim();
        this.apiSecret = (process.env.SHIPROCKET_API_SECRET || '').trim();

        if (!this.apiKey || !this.apiSecret) {
            console.warn("Missing SHIPROCKET_API_KEY or SHIPROCKET_API_SECRET");
        }
    }

    private generateHmac(payloadString: string): string {
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(payloadString)
            .digest('base64');
    }

    async post(endpoint: string, data: any) {
        // Ensure exact string match for HMAC and Body
        const payloadString = JSON.stringify(data);
        const hmac = this.generateHmac(payloadString);
        const url = `${SHIPROCKET_API_BASE}${endpoint}`;

        console.log(`[Shiprocket] POST ${url}`);
        // console.log(`[Shiprocket] Payload: ${payloadString}`); // Debug only

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
            console.error(`[Shiprocket] Error ${response.status}: ${errorText}`);
            throw new Error(`Shiprocket API Error: ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    }
}
