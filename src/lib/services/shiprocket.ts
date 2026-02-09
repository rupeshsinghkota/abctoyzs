export const ShiprocketService = {
    async authenticate() {
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[Shiprocket Auth Error]:', error);
            throw new Error('Failed to authenticate with Shiprocket');
        }

        const data = await response.json();
        return data.token;
    },

    async createOrder(orderData: any) {
        try {
            const token = await this.authenticate();

            const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Order Creation Error]:', error);
                throw new Error('Failed to create order in Shiprocket');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket Service Error]:', error);
            throw error;
        }
    },
    async getTracking(orderId: string) {
        try {
            const token = await this.authenticate();
            const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Tracking Error]:', error);
                throw new Error('Failed to fetch tracking info from Shiprocket');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket Tracking Service Error]:', error);
            throw error;
        }
    },

    async getTrackingByAWB(awb: string) {
        try {
            const token = await this.authenticate();
            const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket AWB Tracking Error]:', error);
                throw new Error('Failed to fetch AWB tracking info from Shiprocket');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket AWB Tracking Service Error]:', error);
            throw error;
        }
    }
};
