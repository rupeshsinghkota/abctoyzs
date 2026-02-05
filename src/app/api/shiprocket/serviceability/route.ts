import { NextResponse } from 'next/server';
import { ShiprocketClient } from '@/lib/services/shiprocket-client';

const client = new ShiprocketClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Endpoint for fetching details (rates, EDD) for a custom platform order
        // This is based on the "Headless" / "Custom" integration docs
        const response = await client.post('/api/v1/custom-platform-order/details', body);

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Shiprocket Serviceability Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch shipping rates' },
            { status: 500 }
        );
    }
}
