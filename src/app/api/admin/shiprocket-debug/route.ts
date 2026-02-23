import { NextResponse } from 'next/server';
import { ShiprocketService } from '@/lib/services/shiprocket';

export const dynamic = 'force-dynamic';

// DELETE THIS ROUTE AFTER DEBUGGING
export async function GET() {
    try {
        // Step 1: Test authentication
        const token = await ShiprocketService.authenticate();

        // Step 2: Fetch pickup locations to get exact names
        const locations = await ShiprocketService.getPickupLocations();

        return NextResponse.json({
            auth: 'SUCCESS ✅',
            pickup_locations: locations.map((l: any) => ({
                id: l.id,
                name: l.pickup_location,        // <-- USE THIS EXACT STRING in push-shiprocket route
                address: l.address,
                city: l.city,
                pin_code: l.pin_code,
                status: l.status,
            })),
        });
    } catch (err: any) {
        return NextResponse.json({
            auth: 'FAILED ❌',
            error: err.message,
        }, { status: 500 });
    }
}
