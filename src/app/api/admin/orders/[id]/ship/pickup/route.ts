import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShiprocketService } from '@/lib/services/shiprocket';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;
        const { pickup_date, shipment_id } = await req.json();

        if (!pickup_date || !shipment_id) {
            return NextResponse.json({ error: 'pickup_date and shipment_id required' }, { status: 400 });
        }

        // Schedule pickup in Shiprocket
        const result = await ShiprocketService.schedulePickup(shipment_id, pickup_date);

        // Update order
        await supabaseAdmin
            .from('orders')
            .update({
                pickup_scheduled_date: pickup_date,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('[Admin API] Schedule pickup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
