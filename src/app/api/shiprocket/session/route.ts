import { NextResponse } from 'next/server';
import { ShiprocketClient } from '@/lib/services/shiprocket-client';

const client = new ShiprocketClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Transform incoming cart data to match Shiprocket expectation if needed
        // Assuming body matches expected structure for now: { cart_data: { items: [...] }, ... }

        const response = await client.post('/api/v1/access-token/checkout', body);

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Shiprocket Session Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
