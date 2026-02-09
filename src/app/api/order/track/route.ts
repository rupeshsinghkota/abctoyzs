import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShiprocketService } from '@/lib/services/shiprocket';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Find the order based on ID, Razorpay ID, or Shiprocket ID
        // We also join with addresses to allow searching by phone number
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, shipping_address:addresses(*)')
            .or(`id.eq.${query},shiprocket_order_id.eq.${query},razorpay_order_id.eq.${query}`)
            .limit(1);

        let order = orders && orders.length > 0 ? orders[0] : null;

        // 2. If no order found by ID, try searching by phone in the joined address
        if (!order) {
            const { data: phoneOrders, error: phoneError } = await supabase
                .from('orders')
                .select('*, shipping_address:addresses(*)')
                .eq('addresses.phone', query) // This might require a different approach depending on Supabase version
                .order('created_at', { ascending: false })
                .limit(1);

            // Re-trying a safer join-based filter if the first one failed
            if (!phoneOrders || phoneOrders.length === 0) {
                const { data: addrData } = await supabase
                    .from('addresses')
                    .select('id')
                    .eq('phone', query);

                if (addrData && addrData.length > 0) {
                    const addrIds = addrData.map(a => a.id);
                    const { data: combinedOrders } = await supabase
                        .from('orders')
                        .select('*, shipping_address:addresses(*)')
                        .in('shipping_address_id', addrIds)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    order = combinedOrders && combinedOrders.length > 0 ? combinedOrders[0] : null;
                }
            } else {
                order = phoneOrders[0];
            }
        }

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (!order.shiprocket_order_id) {
            return NextResponse.json({
                order,
                tracking: { status: 'Pending Shipment', status_code: 0, timeline: [] }
            });
        }

        // 3. Get tracking info from Shiprocket
        const trackingData = await ShiprocketService.getTracking(order.shiprocket_order_id);

        return NextResponse.json({
            order,
            tracking: trackingData
        });

    } catch (error: any) {
        console.error('[Tracking API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
