import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;
        const updates = await req.json();

        // Update order using admin client to bypass RLS
        const { data, error } = await supabaseAdmin
            .from('orders')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error('[Admin API] Order update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error('[Admin API] Order update failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
