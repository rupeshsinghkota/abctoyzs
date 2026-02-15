import crypto from 'crypto';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// Helper to hash data (SHA-256) as required by Meta
const hashData = (data: string | undefined | null) => {
    if (!data) return undefined;
    // Normalize: lowercase, trim, remove special chars for phone
    const normalized = data.trim().toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
};

interface UserData {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Click ID from cookie
    fbp?: string; // Browser ID from cookie
    external_id?: string;
}

interface PurchaseEventData {
    eventId: string; // Unique ID (e.g., Order ID) for deduplication
    eventName: 'Purchase' | 'InitiateCheckout' | 'AddToCart';
    eventTime: number; // Unix timestamp
    userData: UserData;
    customData?: {
        currency: string;
        value: number;
        content_ids?: string[];
        content_type?: string;
        order_id?: string;
        contents?: { id: string; quantity: number }[];
    };
    actionSource: 'website';
    eventSourceUrl: string;
}

export const FacebookCapi = {
    async trackEvent(eventData: PurchaseEventData) {
        if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_PIXEL_ID) {
            console.warn('[FacebookCapi] Missing Access Token or Pixel ID. Skipping CAPI event.');
            return;
        }

        const payload = {
            data: [
                {
                    event_name: eventData.eventName,
                    event_time: eventData.eventTime,
                    action_source: eventData.actionSource,
                    event_source_url: eventData.eventSourceUrl,
                    event_id: eventData.eventId,
                    user_data: {
                        em: hashData(eventData.userData.email),
                        ph: hashData(eventData.userData.phone), // Ensure phone includes country code before hashing if possible
                        fn: hashData(eventData.userData.first_name),
                        ln: hashData(eventData.userData.last_name),
                        ct: hashData(eventData.userData.city),
                        st: hashData(eventData.userData.state),
                        zp: hashData(eventData.userData.zip),
                        country: hashData(eventData.userData.country),
                        client_ip_address: eventData.userData.client_ip_address,
                        client_user_agent: eventData.userData.client_user_agent,
                        fbc: eventData.userData.fbc,
                        fbp: eventData.userData.fbp,
                        external_id: hashData(eventData.userData.external_id),
                    },
                    custom_data: eventData.customData,
                },
            ],
            access_token: FACEBOOK_ACCESS_TOKEN, // Passed in query param or body? Checking docs... usually query param for Graph API POST
        };

        // Graph API v19.0
        const url = `https://graph.facebook.com/v19.0/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('[FacebookCapi] Error sending event:', JSON.stringify(result));
                console.error('[FacebookCapi] Payload was:', JSON.stringify(payload, null, 2));
            } else {
                console.log(`[FacebookCapi] Event ${eventData.eventName} sent successfully. Event ID: ${eventData.eventId}`);
                // console.log('[FacebookCapi] Payload sent:', JSON.stringify(payload)); // Uncomment for deep debugging
            }
        } catch (error) {
            console.error('[FacebookCapi] Network error sending event:', error);
        }
    },
};
