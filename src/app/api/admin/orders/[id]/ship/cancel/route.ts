import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShiprocketService } from '@/lib/services/shiprocket';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;

        // Fetch order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('shiprocket_order_id')
            .eq('id', orderId)
            .single();

        if (orderError || !order || !order.shiprocket_order_id) {
            return NextResponse.json({ error: 'Order or Shiprocket order not found' }, { status: 404 });
        }

        // Cancel in Shiprocket
        await ShiprocketService.cancelShipment(order.shiprocket_order_id);

        // Update order status
        await supabaseAdmin
            .from('orders')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Admin API] Cancel shipment error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
