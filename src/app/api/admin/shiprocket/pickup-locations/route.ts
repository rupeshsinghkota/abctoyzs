import { NextRequest, NextResponse } from 'next/server';
import { ShiprocketService } from '@/lib/services/shiprocket';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const locations = await ShiprocketService.getPickupLocations();
        return NextResponse.json({ success: true, locations });
    } catch (error: any) {
        console.error('[Shiprocket API] Error fetching pickup locations:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch pickup locations'
        }, { status: 500 });
    }
}
