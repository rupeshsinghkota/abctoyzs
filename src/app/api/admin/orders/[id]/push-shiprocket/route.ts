import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShiprocketService } from '@/lib/services/shiprocket';

export const dynamic = 'force-dynamic';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: orderId } = await params;

        // 1. Fetch full order with items and address
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(*),
                shipping_address:addresses(*)
            `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.shiprocket_order_id) {
            return NextResponse.json(
                { error: 'Order already pushed to Shiprocket', shiprocket_order_id: order.shiprocket_order_id },
                { status: 409 }
            );
        }

        // Check for override address from admin (e.g. B2B delivery to warehouse)
        const body = await req.json().catch(() => ({}));
        const overrideAddress = body.override_address || null;

        const address = overrideAddress || order.shipping_address;
        if (!address) {
            return NextResponse.json({ error: 'No shipping address found' }, { status: 400 });
        }

        const guestEmail = order.guest_email || `customer_${address.phone}@abctoyz.in`;
        const advanceAmount = order.advance_amount || 0;
        const totalAmount = order.total_amount;

        // 2. Build Shiprocket payload
        // For Partial COD: sub_total = balance to collect on delivery
        // For Full COD / Prepaid: sub_total = full amount
        const isPartialCod = order.payment_method === 'COD' && advanceAmount > 0;
        const amountToCollect = isPartialCod ? totalAmount - advanceAmount : totalAmount;

        // Shiprocket rejects UUID-format order IDs — use order_number or short suffix
        const srOrderId = order.order_number
            ? String(order.order_number)
            : `AT-${order.id.replace(/-/g, '').slice(-8).toUpperCase()}`;

        const shiprocketPayload = {
            order_id: srOrderId,
            order_date: new Date(order.created_at).toISOString(),
            pickup_location: 'Warehouse',
            billing_customer_name: address.name,
            billing_last_name: '',
            billing_address: address.address_line1,
            billing_address_2: address.address_line2 || '',
            billing_city: address.city,
            billing_pincode: address.pincode,
            billing_state: address.state,
            billing_country: 'India',
            billing_email: guestEmail,
            billing_phone: address.phone,
            shipping_is_billing: true,
            order_items: order.order_items.map((item: any) => ({
                name: item.product_name,
                sku: `SKU-${item.product_id}`,
                units: item.quantity,
                selling_price: item.price,
            })),
            payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
            sub_total: amountToCollect,
            // Package dimensions (default reasonable estimates)
            length: 100,
            breadth: 60,
            height: 50,
            weight: 10.0,
        };

        // 3. Push to Shiprocket
        console.log(`[PushShiprocket] Pushing order ${orderId} to Shiprocket...`);
        const shiprocketRes = await ShiprocketService.createOrder(shiprocketPayload);

        const shiprocketOrderId = shiprocketRes.order_id;
        const shipmentId = shiprocketRes.shipments?.[0]?.id || shiprocketRes.shipment_id || null;

        // 4. Update our DB with Shiprocket IDs
        await supabase
            .from('orders')
            .update({
                shiprocket_order_id: shiprocketOrderId,
                shipment_id: shipmentId,
                shipping_carrier: 'Shiprocket',
                status: 'processing',
            })
            .eq('id', orderId);

        console.log(`[PushShiprocket] Success. SR Order: ${shiprocketOrderId}, Shipment: ${shipmentId}`);

        return NextResponse.json({
            success: true,
            shiprocket_order_id: shiprocketOrderId,
            shipment_id: shipmentId,
        });

    } catch (err: any) {
        console.error('[PushShiprocket] Error:', err.message);
        return NextResponse.json({ error: err.message || 'Failed to push to Shiprocket' }, { status: 500 });
    }
}
