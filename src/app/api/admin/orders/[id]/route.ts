import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;

        // Fetch order with admin client to bypass RLS
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError) throw orderError;

        // Fetch items
        const { data: items } = await supabaseAdmin
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        // Fetch address
        let address = null;
        if (order.shipping_address_id) {
            const { data: addrData } = await supabaseAdmin
                .from('addresses')
                .select('*')
                .eq('id', order.shipping_address_id)
                .single();
            address = addrData;
        }

        return NextResponse.json({
            data: {
                ...order,
                items: items || [],
                shipping_address: address
            }
        });
    } catch (error: any) {
        console.error('[Admin API] Order fetch failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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
