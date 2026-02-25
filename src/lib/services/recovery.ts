import { supabaseAdmin } from '@/lib/supabase/admin';
import { WhatsAppService } from './whatsapp';

export const RECOVERY_STEPS = [
    {
        id: 1,
        delayHours: 1,
        message: (name: string) => `Hi ${name || 'there'}! 👋 You left some awesome toys in your cart at ABC Toyz. Still thinking? Use code *PREPAID5* for an extra *5% OFF* right now! 🚗\n\nComplete your order: https://abctoyz.in/cart`
    },
    {
        id: 2,
        delayHours: 24,
        message: (name: string) => `Still interested, ${name || 'friend'}? 🧸 The items in your cart are in high demand and stock is limited. Don't let your little one miss out on the fun! 🎁\n\nFinish checkout: https://abctoyz.in/cart`
    },
    {
        id: 3,
        delayHours: 72,
        message: (name: string) => `Final call! 📢 We're holding your cart for just a bit longer. Need help with anything or have questions? Just reply to this message! ✨\n\nClaim your toys: https://abctoyz.in/cart`
    }
];

export const RecoveryService = {
    async processAbandonedCarts() {
        console.log('[RecoveryService] Starting abandonment recovery check...');
        const now = new Date();

        // 1. Fetch leads that are 'new' and haven't completed the sequence
        const { data: leads, error } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('status', 'new')
            .lt('last_followup_step', 3)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[RecoveryService] Error fetching leads:', error);
            return { error };
        }

        const stats = { sent: 0, skipped: 0 };

        for (const lead of leads) {
            const nextStepIndex = lead.last_followup_step; // 0, 1, or 2
            const nextStep = RECOVERY_STEPS[nextStepIndex];

            if (!nextStep) continue;

            // Check if enough time has passed since creation or last follow-up
            const baseTime = lead.last_followup_at ? new Date(lead.last_followup_at) : new Date(lead.created_at);
            const hoursSince = (now.getTime() - baseTime.getTime()) / (1000 * 60 * 60);

            // For Step 1, we wait 1h from creation. 
            // For subsequent steps, we wait for the incremental delay? 
            // Let's simplify: Step 1 = 1h from creation, Step 2 = 24h from creation, Step 3 = 72h from creation.
            const totalHoursNeeded = nextStep.delayHours;
            const hoursFromStart = (now.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60);

            if (hoursFromStart >= totalHoursNeeded) {
                console.log(`[RecoveryService] Sending Step ${nextStep.id} to ${lead.phone}`);

                try {
                    const whatsappPhone = lead.phone.length === 10 ? `91${lead.phone}` : lead.phone;
                    const message = nextStep.message(lead.name);

                    await WhatsAppService.sendMessage(whatsappPhone, message);

                    // Update lead
                    await supabaseAdmin
                        .from('leads')
                        .update({
                            last_followup_step: nextStep.id,
                            last_followup_at: now.toISOString(),
                            updated_at: now.toISOString()
                        })
                        .eq('id', lead.id);

                    stats.sent++;
                } catch (err) {
                    console.error(`[RecoveryService] Failed to send message to ${lead.phone}:`, err);
                }
            } else {
                stats.skipped++;
            }
        }

        return { success: true, ...stats };
    }
};
