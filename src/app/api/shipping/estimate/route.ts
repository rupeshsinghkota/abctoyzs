import { NextResponse } from 'next/server';
import { ShiprocketService } from '@/lib/services/shiprocket';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const pincode = searchParams.get('pincode');
        const weight = parseFloat(searchParams.get('weight') || '20.0');
        const length = parseFloat(searchParams.get('length') || '100');
        const breadth = parseFloat(searchParams.get('breadth') || '60');
        const height = parseFloat(searchParams.get('height') || '50');

        if (!pincode || pincode.length !== 6) {
            return NextResponse.json({ error: 'Valid 6-digit Pincode is required' }, { status: 400 });
        }

        const data = await ShiprocketService.getServiceability(pincode, weight, length, breadth, height);

        // Shiprocket returns data.data.available_courier_companies[]
        // We look for the quickest one or a general estimate
        const couriers = data?.data?.available_courier_companies || [];

        if (couriers.length === 0) {
            return NextResponse.json({
                serviceable: false,
                message: 'No delivery services available for this pincode'
            });
        }

        // Get the estimate from the first available courier
        const bestCourier = couriers[0];
        const etdString = bestCourier.etd || bestCourier.estimated_delivery_days;

        // Shiprocket ETD format can vary, but usually it's a date string or days.
        // If it's a date string, we add 1 day for processing.
        // If it's days, we add 1 to the count.

        let estimatedDate: Date;
        if (bestCourier.etd) {
            estimatedDate = new Date(bestCourier.etd);
        } else {
            const days = parseInt(bestCourier.estimated_delivery_days) || 5;
            estimatedDate = new Date();
            estimatedDate.setDate(estimatedDate.getDate() + days);
        }

        // Add 1 day for processing as requested by user
        estimatedDate.setDate(estimatedDate.getDate() + 1);

        return NextResponse.json({
            serviceable: true,
            etd: estimatedDate.toISOString(),
            formattedDate: estimatedDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            }),
            courier: bestCourier.courier_name
        });

    } catch (error: any) {
        console.error('[Shipping Estimate API Error]:', error);
        return NextResponse.json({ error: 'Failed to fetch shipping estimate' }, { status: 500 });
    }
}
