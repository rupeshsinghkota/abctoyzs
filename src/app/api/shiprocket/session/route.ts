import { NextResponse } from 'next/server';
import { ShiprocketService } from '@/lib/services/shiprocket';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.cart_data || !body.cart_data.items) {
            return NextResponse.json({ error: "Invalid Cart Data" }, { status: 400 });
        }

        console.log("Creating Shiprocket Session for:", body.cart_data.items.length, "items");

        const session = await ShiprocketService.createSession(body);
        return NextResponse.json(session);

    } catch (error: any) {
        console.error("Shiprocket Session Route Error:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
