import { createClient } from '@/lib/supabase/client';

export const NewsletterService = {
    async subscribe(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const supabase = createClient();

            // Basic email validation
            if (!email || !email.includes('@')) {
                return { success: false, message: 'Please enter a valid email address.' };
            }

            const { error } = await supabase
                .from('newsletter_subscriptions')
                .upsert({ email }, { onConflict: 'email' });

            if (error) {
                console.error("[NewsletterService] Error subscribing:", error.message);
                return { success: false, message: 'Failed to subscribe. Please try again later.' };
            }

            return { success: true, message: 'Successfully subscribed to the newsletter!' };
        } catch (e) {
            console.error("[NewsletterService] Unexpected error:", e);
            return { success: false, message: 'An unexpected error occurred.' };
        }
    }
};
