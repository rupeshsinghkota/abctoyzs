import { NextRequest, NextResponse } from 'next/server';
import { ShiprocketService } from '@/lib/services/shiprocket';

// GET available courier options for a Shiprocket order
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: shiprocketOrderId } = await params;

        const couriers = await ShiprocketService.getAvailableCouriers(shiprocketOrderId);

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
