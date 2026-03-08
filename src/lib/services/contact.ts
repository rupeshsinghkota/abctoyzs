import { createClient } from '@/lib/supabase/server';
import { WhatsAppService } from './whatsapp';
import { EmailService } from './email';

export const ContactService = {
    async submitInquiry(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
        const supabase = await createClient();

        console.log('[ContactService] Submitting inquiry:', data);

        const { data: inquiry, error } = await supabase
            .from('contact_inquiries')
            .insert([
                {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    subject: data.subject,
                    message: data.message,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('[ContactService] Error saving inquiry:', error);
            throw error;
        }

        // Notify Admin via WhatsApp (Optional/If configured)
        try {
            const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || "917557777998";
            const adminText = `🆕 *New Contact Inquiry* on abcToyz\n\n*Name:* ${data.name}\n*Email:* ${data.email}${data.phone ? `\n*WhatsApp:* ${data.phone}` : ''}\n*Subject:* ${data.subject}\n*Message:* ${data.message}`;
            await WhatsAppService.sendMessage(adminPhone, adminText);
        } catch (wsError) {
            console.error('[ContactService] WhatsApp notification failed:', wsError);
        }

        // Notify Admin via Email (Optional/If configured)
        // EmailService.sendInquiryNotification(data);

        return { success: true, inquiry };
    }
};
