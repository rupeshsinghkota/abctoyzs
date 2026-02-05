import { NextResponse } from 'next/server';
import { ShiprocketClient } from '@/lib/services/shiprocket-client';

const client = new ShiprocketClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Push order to Shiprocket
        // Guessing endpoint as 'create' under custom-platform-order namespace
        // If this 404s, the user will see it in logs and we can adjust.
        const response = await client.post('/api/v1/custom-platform-order/create', body);

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Shiprocket Order Placement Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to push order to Shiprocket' },
            { status: 500 }
        );
    }
}
