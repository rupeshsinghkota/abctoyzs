import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { WhatsAppService } from '@/lib/services/whatsapp';

export async function GET(req: Request) {
    try {
        // 1. Basic Security (Verify CRON_SECRET if available)
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Leads that are NOT converted and haven't finished the sequence (Step 4 is 'end')
        const { data: leads, error: leadsError } = await supabaseAdmin
            .from('leads')
            .select('*')
            .neq('status', 'converted')
            .lt('last_followup_step', 4); // Steps 0, 1, 2, 3

        if (leadsError) throw leadsError;
        if (!leads || leads.length === 0) {
            return NextResponse.json({ message: 'No active leads' });
        }

        const now = new Date();
        const results: any[] = [];

        // 3. Process each lead based on its current step and age
        for (const lead of leads) {
            try {
                const createdAt = new Date(lead.created_at);
                const lastFollowupAt = lead.last_followup_at ? new Date(lead.last_followup_at) : null;
                const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
                const hoursSinceLastFollowup = lastFollowupAt ? (now.getTime() - lastFollowupAt.getTime()) / (1000 * 60 * 60) : hoursSinceCreated;

                let nextStep = -1;
                let templateId = '';
                let variables: any = {};
                let mediaUrl = '';

                // DETERMINE NEXT STEP
                const currentStep = lead.last_followup_step || 0;

                if (currentStep === 0 && hoursSinceCreated >= 1 && hoursSinceCreated <= 4) {
                    // STEP 0: 1-2 Hour Quick Reminder (Existing Logic)
                    nextStep = 1;
                    templateId = 'cart_recovery_media';
                    const cart = lead.cart_summary || [];
                    const item = cart[0] || { name: 'Jeep', image: 'https://abctoyz.in/logo.png' };
                    mediaUrl = item.image;
                    variables = { "1": lead.name || 'Parent', "2": item.name };
                }
                else if (currentStep === 1 && hoursSinceLastFollowup >= 24) {
                    // STEP 1: 24 Hour Feature Nudge
                    nextStep = 2;
                    templateId = 'cart_recovery_media'; // Reusing for consistency, or use specific ones if available
                    const cart = lead.cart_summary || [];
                    const item = cart[0] || { name: 'Jeep', image: 'https://abctoyz.in/logo.png' };
                    mediaUrl = item.image;
                    variables = {
                        "1": lead.name || 'Parent',
                        "2": `Still thinking about the ${item.name}? It features powerful 4x4 motors and long-range battery!`
                    };
                }
                else if (currentStep === 2 && hoursSinceLastFollowup >= 24) {
                    // STEP 2: 48 Hour Discount Nudge
                    nextStep = 3;
                    templateId = 'cart_recovery_media';
                    const cart = lead.cart_summary || [];
                    const item = cart[0] || { name: 'Jeep', image: 'https://abctoyz.in/logo.png' };
                    mediaUrl = item.image;
                    variables = {
                        "1": lead.name || 'Parent',
                        "2": `Special Offer! Use code PREPAID5 for extra 5% off on your ${item.name}. Secure your ride-on today!`
                    };
                }
                else if (currentStep === 3 && hoursSinceLastFollowup >= 24) {
                    // STEP 3: 72 Hour Final Nudge (Scarcity)
                    nextStep = 4; // Mark as sequence complete
                    templateId = 'cart_recovery_media';
                    const cart = lead.cart_summary || [];
                    const item = cart[0] || { name: 'Jeep', image: 'https://abctoyz.in/logo.png' };
                    mediaUrl = item.image;
                    variables = {
                        "1": lead.name || 'Parent',
                        "2": `Last chance! Stock for the ${item.name} is running low. Grab yours before it's gone!`
                    };
                }

                // SEND MESSAGE IF STEP DETERMINED
                if (nextStep !== -1) {
                    const whatsappPhone = lead.phone.length === 10 ? `91${lead.phone}` : lead.phone;
                    const sent = await WhatsAppService.sendMediaTemplateMessage(
                        whatsappPhone,
                        templateId,
                        mediaUrl || 'https://abctoyz.in/logo.png',
                        variables
                    );

                    if (sent) {
                        // Update lead tracking
                        await supabaseAdmin
                            .from('leads')
                            .update({
                                last_followup_step: nextStep,
                                last_followup_at: now.toISOString(),
                                updated_at: now.toISOString()
                            })
                            .eq('id', lead.id);

                        results.push({ phone: lead.phone, step: nextStep, status: 'sent' });
                    } else {
                        results.push({ phone: lead.phone, step: nextStep, status: 'failed' });
                    }
                }
            } catch (err: any) {
                results.push({ phone: lead.phone, error: err.message });
            }
        }

        return NextResponse.json({
            processed: leads.length,
            results: results
        });

    } catch (error: any) {
        console.error('[CRON RECOVER CARTS] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
