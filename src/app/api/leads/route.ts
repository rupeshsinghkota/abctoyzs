import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const { phone, email, name, source, cart_summary } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        // Clean phone number
        const cleanPhone = phone.replace(/\D/g, "");

        if (cleanPhone.length < 10) {
            return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
        }

        // Upsert lead based on phone number
        const { data, error } = await supabaseAdmin
            .from('leads')
            .upsert({
                phone: cleanPhone,
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

        return NextResponse.json({ success: true, lead: data?.[0] });

    } catch (error: any) {
        console.error('[Lead Capture API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
