import { supabaseAdmin } from "@/lib/supabase/admin";
import { WhatsAppService } from "./whatsapp";

export const OTPService = {
    /**
     * Generates a 6-digit OTP, saves it to DB, and sends via WhatsApp.
     */
    async sendOTP(phone: string) {
        // 1. Clean phone number
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // 2. Save to DB (upsert based on phone) using Admin client to bypass RLS
        const { error } = await supabaseAdmin.from('otp_verifications').upsert({
            phone: cleanPhone,
            otp_code: otp,
            expires_at: expiresAt.toISOString(),
            verified: false,
            attempts: 0
        }, { onConflict: 'phone' });

        if (error) {
            console.error("Failed to save OTP:", error);
            throw new Error("Database error saving OTP");
        }

        // 3. Send via WhatsApp
        const templateId = process.env.MSG91_OTP_TEMPLATE_ID || 'auth';
        // Try template first
        let sent = await WhatsAppService.sendTemplateMessage(cleanPhone, templateId, { "1": otp });

        // Fallback to text if template fails
        if (!sent) {
            const message = `🗝️ *ABC Toyz Verification*\n\nYour login code is: *${otp}*\n\nValid for 10 minutes.`;
            sent = await WhatsAppService.sendMessage(cleanPhone, message);
        }

        if (!sent) throw new Error("Failed to send WhatsApp message");

        return true;
    },

    /**
     * Verifies the OTP for a given phone number.
     */
    async verifyOTP(phone: string, code: string) {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const { data, error } = await supabaseAdmin
            .from('otp_verifications')
            .select('*')
            .eq('phone', cleanPhone)
            .eq('otp_code', code)
            .eq('verified', false)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (error || !data) {
            return false;
        }

        // Mark as verified
        await supabaseAdmin
            .from('otp_verifications')
            .update({ verified: true })
            .eq('id', data.id);

        return true;
    }
};
