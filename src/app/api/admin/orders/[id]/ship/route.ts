import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShiprocketService } from '@/lib/services/shiprocket';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;

        // Fetch order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            console.error('[Ship API] Order error:', orderError);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if already shipped
        if (order.shiprocket_order_id) {
            return NextResponse.json({
                error: 'Order already synced to Shiprocket',
                shiprocket_order_id: order.shiprocket_order_id
            }, { status: 400 });
        }

        // Fetch shipping address
        const { data: address, error: addressError } = await supabaseAdmin
            .from('addresses')
            .select('*')
            .eq('id', order.shipping_address_id)
            .single();

        if (addressError || !address) {
            console.error('[Ship API] Address error:', addressError);
            return NextResponse.json({ error: 'Shipping address not found' }, { status: 404 });
        }

        // Fetch order items
        const { data: items, error: itemsError } = await supabaseAdmin
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        if (itemsError || !items || items.length === 0) {
            console.error('[Ship API] Items error:', itemsError);
            return NextResponse.json({ error: 'Order items not found' }, { status: 404 });
        }

        // Fetch available pickup locations from Shiprocket
        let pickupLocation = "Primary"; // Default fallback
        try {
            const locations = await ShiprocketService.getPickupLocations();
            if (locations && locations.length > 0) {
                pickupLocation = locations[0].pickup_location; // Use first available location
                console.log('[Ship API] Using pickup location:', pickupLocation);
            }
        } catch (locError) {
            console.warn('[Ship API] Could not fetch pickup locations, using default:', locError);
        }

        // Prepare Shiprocket order
        const shiprocketOrder = {
            order_id: order.id,
            order_date: new Date().toISOString(),
            pickup_location: pickupLocation,
            billing_customer_name: address.name,
            billing_last_name: "",
            billing_address: address.address_line1,
            billing_address_2: address.address_line2 || "",
            billing_city: address.city,
            billing_pincode: address.pincode,
            billing_state: address.state,
            billing_country: "India",
            billing_email: address.email || order.guest_email || "noreply@abctoyz.in",
            billing_phone: address.phone,
            shipping_is_billing: true,
            order_items: items.map((item: any) => ({
                name: item.product_name,
                sku: `SKU-${item.product_id}`,
                units: item.quantity,
                selling_price: item.price,
            })),
            payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
            sub_total: order.payment_method === 'COD' ? (order.total_amount - 500) : order.total_amount,
            length: 100,
            breadth: 60,
            height: 50,
            weight: 10.0,
        };

        // Create order in Shiprocket
        console.log('[Ship API] Creating Shiprocket order:', shiprocketOrder);
        const shiprocketRes = await ShiprocketService.createOrder(shiprocketOrder);
        console.log('[Ship API] Shiprocket response:', shiprocketRes);

        // Update order with Shiprocket ID
        await supabaseAdmin
            .from('orders')
            .update({
                shiprocket_order_id: shiprocketRes.order_id,
                shipping_carrier: 'Shiprocket',
                updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

        return NextResponse.json({
            success: true,
            shiprocket_order_id: shiprocketRes.order_id,
            data: shiprocketRes
        });

    } catch (error: any) {
        console.error('[Admin API] Shiprocket ship error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
