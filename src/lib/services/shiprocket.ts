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
    }
};
