"use client";

// Based on Postman analysis for HEADLESS / CUSTOM CHECKOUT
export type ShiprocketCheckoutItem = {
    variant_id: string; // Required by Shiprocket
    quantity: number;
    catalog_data?: {    // Optional: for custom prices/names
        price: number;
        name: string;
        image_url?: string;
    }
};

export type ShiprocketSessionRequest = {
    cart_data: {
        items: ShiprocketCheckoutItem[];
        custom_attributes?: Record<string, string>;
        mobile_app?: boolean;
    };
    redirect_url: string;
    timestamp: string;
};

export type ShiprocketRate = {
    courier_name: string;
    rate: number;
    edd: string;
    description?: string;
};

export const ShiprocketService = {
    isEnabled() {
        return true;
    },

    async createSession(data: ShiprocketSessionRequest) {
        const res = await fetch('/api/shiprocket/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errBody = await res.json();
            throw new Error(errBody.error || 'Failed to create Shiprocket session');
        }
        return await res.json();
    },

    async fetchRates(data: {
        cart_data: { items: any[] };
        shipping_address: {
            pincode: number;
            city: string;
            state: string;
            country: string;
        };
        payment_method: 'PREPAID' | 'COD';
    }): Promise<ShiprocketRate[]> {
        try {
            const res = await fetch('/api/shiprocket/serviceability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                console.error('Shiprocket Rate Fetch Failed');
                return [];
            }

            const response = await res.json();
            // Parse response to extract rates
            // Assuming response structure contains a list of couriers/plans
            // Adjust based on actual API response
            if (response.data && response.data.shipping_plans) {
                return response.data.shipping_plans.map((plan: any) => ({
                    courier_name: plan.courier_name || 'Standard Shipping',
                    rate: plan.rate || 0,
                    edd: plan.edd || '',
                    description: plan.description
                }));
            }
            return [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }
};
