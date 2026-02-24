import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { WhatsAppService } from '@/lib/services/whatsapp';

export async function POST(req: Request) {
    try {
        const { phone, email, name, source, cart_summary } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        // Clean and normalize to 10 digits
        const cleanPhone = phone.replace(/\D/g, "");
        const leadPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

        if (leadPhone.length < 10) {
            return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
        }

        // Upsert lead based on phone number
        const { data, error } = await supabaseAdmin
            .from('leads')
            .upsert({
                phone: leadPhone,
                email: email || null,
                name: name || null,
                source: source || 'checkout',
                cart_summary: cart_summary || null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'phone',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('[Lead Capture Error]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // --- NEW: Send Welcome WhatsApp Message ---
        try {
            // Ensure phone has country code (assuming IN +91 for now if length is 10)
            const whatsappPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

            // Send Template Message (using a standard welcome or fallback to text if template not set)
            // For now, using direct text to ensure it works immediately without template approval
            const welcomeMessage = `Welcome to ABC Toyz! 🚗\n\nYour little one's adventure starts here. Use code *PREPAID5* to get *5% OFF* on all prepaid orders.\n\nShop now: https://abctoyz.in`;

            // Fire and forget (don't block response)
            WhatsAppService.sendMessage(whatsappPhone, welcomeMessage)
                .catch(err => console.error("Failed to send welcome WP:", err));

        } catch (wpError) {
            console.error("WhatsApp trigger error:", wpError);
        }
        // ------------------------------------------

        return NextResponse.json({ success: true, lead: data?.[0] });

    } catch (error: any) {
        console.error('[Lead Capture API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
