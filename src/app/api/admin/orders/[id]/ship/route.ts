import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShiprocketService } from '@/lib/services/shiprocket';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;

        // Fetch full order details
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                items:order_items(*),
                shipping_address:addresses(*)
            `)
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if already shipped to Shiprocket
        if (order.shiprocket_order_id) {
            return NextResponse.json({
                error: 'Order already synced to Shiprocket',
                shiprocket_order_id: order.shiprocket_order_id
            }, { status: 400 });
        }

        // Prepare Shiprocket order
        const shiprocketOrder = {
            order_id: order.id,
            order_date: new Date().toISOString(),
            pickup_location: "Jhandewalan",
            billing_customer_name: order.shipping_address.name,
            billing_last_name: "",
            billing_address: order.shipping_address.address_line1,
            billing_address_2: order.shipping_address.address_line2 || "",
            billing_city: order.shipping_address.city,
            billing_pincode: order.shipping_address.pincode,
            billing_state: order.shipping_address.state,
            billing_country: "India",
            billing_email: order.shipping_address.email || order.guest_email || "noreply@abctoyz.in",
            billing_phone: order.shipping_address.phone,
            shipping_is_billing: true,
            order_items: order.items.map((item: any) => ({
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
        const shiprocketRes = await ShiprocketService.createOrder(shiprocketOrder);

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
