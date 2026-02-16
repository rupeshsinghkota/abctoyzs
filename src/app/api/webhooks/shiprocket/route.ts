import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Shiprocket Webhook Handler
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log('[Shiprocket Webhook] Received:', JSON.stringify(payload, null, 2));

        // Extract event data
        const {
            order_id,
            awb,
            courier_name,
            courier_company_id,
            current_status,
            shipment_id,
            tracking_url,
            etd,
        } = payload;

        if (!order_id) {
            console.error('[Shiprocket Webhook] Missing order_id in payload');
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
        }

        // Find order by shiprocket_order_id
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('id, status, shipping_address_id')
            .eq('shiprocket_order_id', order_id)
            .single();

        if (orderError || !order) {
            console.error('[Shiprocket Webhook] Order not found:', order_id, orderError);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log('[Shiprocket Webhook] Found order:', order.id);

        // Map Shiprocket status to our order status
        const statusMap: Record<string, string> = {
            'READY_TO_SHIP': 'processing',
            'SHIPPED': 'shipped',
            'IN_TRANSIT': 'shipped',
            'OUT_FOR_DELIVERY': 'shipped',
            'DELIVERED': 'delivered',
            'CANCELLED': 'cancelled',
            'RTO': 'returned',
            'RTO_DELIVERED': 'returned',
        };

        const newStatus = statusMap[current_status] || order.status;

        // Update order with webhook data
        const updateData: any = {
            status: newStatus,
        };

        if (awb) updateData.awb = awb;
        if (courier_name) updateData.courier_name = courier_name;
        if (courier_company_id) updateData.courier_id = courier_company_id;
        if (shipment_id) updateData.shipment_id = shipment_id;

        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update(updateData)
            .eq('id', order.id);

        if (updateError) {
            console.error('[Shiprocket Webhook] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        console.log('[Shiprocket Webhook] Order updated:', order.id, 'New status:', newStatus);

        // Send WhatsApp notification when shipped
        if (current_status === 'SHIPPED' && awb) {
            try {
                // Get customer phone from shipping address
                const { data: address } = await supabaseAdmin
                    .from('addresses')
                    .select('phone, name')
                    .eq('id', order.shipping_address_id)
                    .single();

                if (address?.phone) {
                    // Dynamic import to avoid circular dependencies
                    const { WhatsAppService } = await import('@/lib/services/whatsapp');

                    const trackingLink = tracking_url || `https://shiprocket.co/tracking/${awb}`;
                    const message = `🚚 *Great News!* Your order has been shipped!\n\n` +
                        `📦 *Order ID:* ${order.id}\n` +
                        `🚛 *Courier:* ${courier_name}\n` +
                        `📝 *AWB:* ${awb}\n` +
                        `📍 *Track Order:* ${trackingLink}\n\n` +
                        `${etd ? `📅 *Expected Delivery:* ${etd}\n\n` : ''}` +
                        `Thank you for shopping with us! 🎉`;

                    await WhatsAppService.sendMessage(address.phone, message);
                    console.log('[Shiprocket Webhook] Tracking notification sent to:', address.phone);
                }
            } catch (whatsappError) {
                console.error('[Shiprocket Webhook] WhatsApp notification error:', whatsappError);
                // Don't fail the webhook if WhatsApp fails
            }
        }

        // Send delivery confirmation
        if (current_status === 'DELIVERED') {
            try {
                const { data: address } = await supabaseAdmin
                    .from('addresses')
                    .select('phone, name')
                    .eq('id', order.shipping_address_id)
                    .single();

                if (address?.phone) {
                    const { WhatsAppService } = await import('@/lib/services/whatsapp');

                    const message = `✅ *Order Delivered Successfully!*\n\n` +
                        `📦 *Order ID:* ${order.id}\n` +
                        `🎉 Thank you for your purchase!\n\n` +
                        `We hope you love your new product. If you have any questions or concerns, feel free to reach out!\n\n` +
                        `⭐ We'd love to hear your feedback!`;

                    await WhatsAppService.sendMessage(address.phone, message);
                    console.log('[Shiprocket Webhook] Delivery confirmation sent to:', address.phone);
                }
            } catch (whatsappError) {
                console.error('[Shiprocket Webhook] WhatsApp delivery notification error:', whatsappError);
            }
        }

        return NextResponse.json({
            success: true,
            order_id: order.id,
            status: newStatus
        });

    } catch (error: any) {
        console.error('[Shiprocket Webhook] Error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: 'Shiprocket Webhook Handler'
    });
}
