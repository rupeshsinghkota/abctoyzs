

export const WhatsAppService = {
    /**
     * Sends a WhatsApp text message via MSG91 API.
     * @param to Recipient phone number (with country code)
     * @param text Message content
     */
    async sendMessage(to: string, text: string) {
        const apiKey = process.env.MSG91_AUTH_KEY;
        const sender = process.env.MSG91_SENDER_NUMBER || process.env.MSG91_INTEGRATED_NUMBER || "917557777998";

        if (!apiKey || !sender) {
            console.error("Missing MSG91 Configuration");
            return;
        }

        const url = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

        const payload = {
            integrated_number: sender,
            content_type: "text",
            text: text,
            recipient_number: to
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
        }
    },

    /**
     * Sends a WhatsApp template message via MSG91 API.
     * @param to Recipient phone number (with country code)
     * @param templateId The MSG91 Template ID (Flow ID)
     * @param variables Object containing template variables { "1": "Value", "2": "Value" }
     */
    async sendTemplateMessage(to: string, templateId: string, variables: Record<string, string>) {
        const apiKey = process.env.MSG91_AUTH_KEY;
        const sender = process.env.MSG91_SENDER_NUMBER || process.env.MSG91_INTEGRATED_NUMBER || "917557777998";

        if (!apiKey || !sender) {
            console.error("Missing MSG91 Configuration");
            return;
        }

        const url = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

        // Convert flat variables object { "1": "val" } to Meta components structure
        const components: any[] = [
            {
                type: "body",
                parameters: Object.keys(variables).map(key => ({
                    type: "text",
                    text: variables[key]
                }))
            }
        ];

        // If template has OTP/Url button (detected by variable "1" being present and assumed to be OTP)
        // AND it's likely an auth template.
        // For safety, we can check if templateId contains 'auth' or just try to add it if "1" is present.
        // Given the error "Button ... requires parameter", we MUST add it for this template.
        if (variables["1"]) {
            components.push({
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                    {
                        type: "text",
                        text: variables["1"]
                    }
                ]
            });
        }

        const payload = {
            integrated_number: sender,
            content_type: "template",
            payload: {
                messaging_product: "whatsapp",
                to: to,
                type: "template",
                template: {
                    name: templateId,
                    language: {
                        code: "en",
                        policy: "deterministic"
                    },
                    components: components
                }
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
                console.error(`MSG91 Template Error (${response.status}):`, errorText);
                throw new Error(`Failed to send template message: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("MSG91 Template Response:", data);
            return data;

        } catch (error) {
            console.error("WhatsApp Template Service Error:", error);
        }
    },

    /**
     * Sends a WhatsApp media message (image) with caption via MSG91 API.
     * @param to Recipient phone number (with country code)
     * @param imageUrl Public URL of the image
     * @param caption Optional caption for the image
     */
    async sendMediaMessage(to: string, imageUrl: string, caption: string = "") {
        const apiKey = process.env.MSG91_AUTH_KEY;
        const sender = process.env.MSG91_SENDER_NUMBER || process.env.MSG91_INTEGRATED_NUMBER || "917557777998";

        if (!apiKey || !sender) {
            console.error("Missing MSG91 Configuration");
            return;
        }

        const url = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

        const payload = {
            integrated_number: sender,
            content_type: "media",
            type: "image",
            recipient_number: to,
            url: imageUrl,
            caption: caption
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
                console.error(`MSG91 Media Error (${response.status}):`, errorText);
                throw new Error(`Failed to send media message: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("MSG91 Media Response:", data);
            return data;

        } catch (error) {
            console.error("WhatsApp Media Service Error:", error);
        }
    },

    /**
     * Sends a WhatsApp template message with a media header (e.g. image) via MSG91 API.
     * @param to Recipient phone number (with country code)
     * @param templateId The MSG91 Template ID (Flow ID)
     * @param mediaUrl URL of the image to be used as header
     * @param variables Object containing template variables { "1": "Value", "2": "Value" }
     */
    async sendMediaTemplateMessage(to: string, templateId: string, mediaUrl: string, variables: Record<string, string>) {
        const apiKey = process.env.MSG91_AUTH_KEY;
        const sender = process.env.MSG91_SENDER_NUMBER || process.env.MSG91_INTEGRATED_NUMBER || "917557777998";

        if (!apiKey || !sender) {
            console.error("Missing MSG91 Configuration");
            return;
        }

        const url = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

        const components: any[] = [
            {
                type: "header",
                parameters: [
                    {
                        type: "image",
                        image: {
                            link: mediaUrl
                        }
                    }
                ]
            },
            {
                type: "body",
                parameters: Object.keys(variables).map(key => ({
                    type: "text",
                    text: variables[key]
                }))
            }
        ];

        const payload = {
            integrated_number: sender,
            content_type: "template",
            payload: {
                messaging_product: "whatsapp",
                to: to,
                type: "template",
                template: {
                    name: templateId,
                    language: {
                        code: "en",
                        policy: "deterministic"
                    },
                    components: components
                }
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
                console.error(`MSG91 Media Template Error (${response.status}):`, errorText);
                throw new Error(`Failed to send media template message: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("MSG91 Media Template Response:", data);
            return data;

        } catch (error) {
            console.error("WhatsApp Media Template Service Error:", error);
        }
    }
};
