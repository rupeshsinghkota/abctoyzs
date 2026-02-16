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

    async getPickupLocations() {
        try {
            const token = await this.authenticate();
            const response = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Get Pickup Locations Error]:', error);
                throw new Error('Failed to fetch pickup locations');
            }

            const data = await response.json();
            return data.data?.shipping_address || [];
        } catch (error) {
            console.error('[Shiprocket Get Pickup Locations Service Error]:', error);
            throw error;
        }
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
    },

    async getServiceability(delivery_postcode: string, weight: number = 10.0, length: number = 100, breadth: number = 60, height: number = 50, is_cod: boolean = false) {
        try {
            const token = await this.authenticate();

            // Shiprocket Serviceability API
            // pickup_postcode is 110055 (Jhandewalan)
            const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=110055&delivery_postcode=${delivery_postcode}&weight=${weight}&length=${length}&breadth=${breadth}&height=${height}&cod=${is_cod ? 1 : 0}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Serviceability Error]:', error);
                throw new Error('Pincode serviceability check failed');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket Serviceability Service Error]:', error);
            throw error;
        }
    },

    // Get available courier companies for a Shiprocket order
    async getAvailableCouriers(shiprocketOrderId: string) {
        try {
            const token = await this.authenticate();
            const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/assign/awb`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipment_id: shiprocketOrderId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Get Couriers Error]:', error);
                throw new Error('Failed to fetch courier options');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket Get Couriers Service Error]:', error);
            throw error;
        }
    },

    // Assign courier to shipment (generates AWB)
    async assignCourier(shipmentId: string, courierId: number) {
        try {
            const token = await this.authenticate();
            const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/assign/awb`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipment_id: shipmentId,
                    courier_id: courierId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Assign Courier Error]:', error);
                throw new Error('Failed to assign courier');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket Assign Courier Service Error]:', error);
            throw error;
        }
    },

    // Cancel shipment
    async cancelShipment(orderId: string) {
        try {
            const token = await this.authenticate();
            const response = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ids: [orderId]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Cancel Error]:', error);
                throw new Error('Failed to cancel shipment');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket Cancel Service Error]:', error);
            throw error;
        }
    },

    // Schedule pickup
    async schedulePickup(shipmentId: string, pickupDate: string) {
        try {
            const token = await this.authenticate();
            const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/generate/pickup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipment_id: [shipmentId],
                    pickup_date: pickupDate
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Schedule Pickup Error]:', error);
                throw new Error('Failed to schedule pickup');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket Schedule Pickup Service Error]:', error);
            throw error;
        }
    },

    // Get shipment details
    async getShipmentDetails(shiprocketOrderId: string) {
        try {
            const token = await this.authenticate();
            const response = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/show/${shiprocketOrderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Shiprocket Get Shipment Error]:', error);
                throw new Error('Failed to get shipment details');
            }

            return await response.json();
        } catch (error) {
            console.error('[Shiprocket Get Shipment Service Error]:', error);
            throw error;
        }
    }
};
