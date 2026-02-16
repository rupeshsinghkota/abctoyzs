
export const WhatsAppService = {
    /**
     * Sends a WhatsApp message via MSG91 API.
     * @param to Recipient phone number (with country code)
     * @param text Message content
     */
    async sendMessage(to: string, text: string) {
        const apiKey = process.env.MSG91_AUTH_KEY;
        const sender = process.env.MSG91_SENDER_NUMBER || "918239269217"; // Integrated number

        if (!apiKey || !sender) {
            console.error("Missing MSG91 Configuration");
            return;
        }

        const url = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

        const payload = {
            integrated_number: sender,
            content_type: "text",
            payload: {
                text: text
            },
            recipient: {
                number: to
            }
        };

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

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`MSG91 Error (${response.status}):`, errorText);
                throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("MSG91 Response:", data);
            return data;

        } catch (error) {
            console.error("WhatsApp Service Error:", error);
            // Don't throw here to avoid crashing the webhook loop, just log
        }
    }
};
