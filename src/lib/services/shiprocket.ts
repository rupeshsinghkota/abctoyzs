import { ShiprocketClient } from "./shiprocket-client";

const client = new ShiprocketClient();

export type ShiprocketSessionRequest = {
    cart_data: {
        items: {
            variant_id: string;
            quantity: number;
            catalog_data?: {
                price: number;
                name: string;
                image_url?: string;
            };
        }[];
    };
    redirect_url: string;
    timestamp: string;
};

export const ShiprocketService = {
    async createSession(data: ShiprocketSessionRequest) {
        // Use the Checkout API endpoint for session creation
        // Endpoint: /api/v1/access-token/checkout
        return await client.post('/api/v1/access-token/checkout', data);
    }
};
