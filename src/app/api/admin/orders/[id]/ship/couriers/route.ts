import { NextRequest, NextResponse } from 'next/server';
import { ShiprocketService } from '@/lib/services/shiprocket';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET available courier options for a Shiprocket order
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;

        // Fetch order to get shipment_id
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('shipment_id')
            .eq('id', orderId)
            .single();

        if (error || !order || !order.shipment_id) {
            console.error('[Couriers API] Order or shipment_id not found:', error);
            return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
        }

        console.log('[Couriers API] Fetching couriers for shipment:', order.shipment_id);
        const couriers = await ShiprocketService.getAvailableCouriers(order.shipment_id);

        return NextResponse.json({ couriers: couriers.data });
    } catch (error: any) {
        console.error('[Admin API] Get couriers error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST to assign selected courier
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;
        const { courier_id } = await req.json();

        if (!courier_id) {
            return NextResponse.json({ error: 'courier_id required' }, { status: 400 });
        }

        // Fetch shipment_id from order
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('shipment_id')
            .eq('id', orderId)
            .single();

        if (error || !order || !order.shipment_id) {
            return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
        }

        const result = await ShiprocketService.assignCourier(order.shipment_id, courier_id);

        // Update order with AWB and courier details
        if (result.response?.data?.awb_assign_status === 1) {
            await supabaseAdmin
                .from('orders')
                .update({
                    awb: result.response.data.awb_code,
                    courier_id: courier_id,
                    courier_name: result.response.data.courier_name,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('[Admin API] Assign courier error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST to assign selected courier
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: shiprocketOrderId } = await params;
        const { courier_id } = await req.json();

        if (!courier_id) {
            return NextResponse.json({ error: 'courier_id required' }, { status: 400 });
        }

        const result = await ShiprocketService.assignCourier(shiprocketOrderId, courier_id);

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('[Admin API] Assign courier error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
