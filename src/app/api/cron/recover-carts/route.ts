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

        // 2. Define Time Window (Carts abandoned 60-120 mins ago)
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        const twoHoursAgo = new Date(now.getTime() - 120 * 60 * 1000).toISOString();

        // 3. Fetch Leads in window
        const { data: leads, error: leadsError } = await supabaseAdmin
            .from('leads')
            .select('*')
            .neq('status', 'converted')
            .gte('created_at', twoHoursAgo)
            .lte('created_at', oneHourAgo);

        if (leadsError) throw leadsError;
        if (!leads || leads.length === 0) {
            return NextResponse.json({ message: 'No abandoned carts found in this window' });
        }

        // 4. Fetch successful orders in same window to exclude
        // We look for any order by these phone numbers created after the lead
        const phoneNumbers = leads.map(l => l.phone);
        const { data: recentOrders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('customer_phone')
            .in('customer_phone', phoneNumbers)
            .gte('created_at', twoHoursAgo);

        if (ordersError) throw ordersError;

        const orderedPhones = new Set(recentOrders?.map(o => o.customer_phone));

        // 5. Filter for true abandonments (Lead exists, but no Order)
        const abandonments = leads.filter(l => !orderedPhones.has(l.phone));

        if (abandonments.length === 0) {
            return NextResponse.json({ message: 'All leads in window converted to orders' });
        }

        // 6. Trigger Recovery Messages
        const results = await Promise.all(abandonments.map(async (lead) => {
            try {
                const cart = lead.cart_summary || [];
                if (cart.length === 0) return { phone: lead.phone, status: 'skipped', reason: 'empty_cart' };

                const primaryItem = cart[0];
                const displayName = lead.name || 'Parent';
                const whatsappPhone = lead.phone.length === 10 ? `91${lead.phone}` : lead.phone;

                // Use the media template: cart_recovery_media
                // Variables: {{1}} = Name, {{2}} = Product Name
                const sent = await WhatsAppService.sendMediaTemplateMessage(
                    whatsappPhone,
                    'cart_recovery_media',
                    primaryItem.image || 'https://abctoyz.in/logo.png', // Fallback to logo
                    {
                        "1": displayName,
                        "2": primaryItem.name
                    }
                );

                return { phone: lead.phone, status: sent ? 'sent' : 'failed' };
            } catch (err: any) {
                return { phone: lead.phone, status: 'error', error: err.message };
            }
        }));

        return NextResponse.json({
            processed: abandonments.length,
            results: results
        });

    } catch (error: any) {
        console.error('[CRON RECOVER CARTS] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
