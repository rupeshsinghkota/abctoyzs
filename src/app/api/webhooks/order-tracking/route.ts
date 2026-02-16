import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Shiprocket Webhook Handler
export async function POST(req: NextRequest) {
    try {
        let payload;
        try {
            payload = await req.json();
        } catch (e) {
            console.log('[Shiprocket Webhook] Received empty or non-JSON payload, returning 200 for validation.');
            return NextResponse.json({ success: true, message: 'Endpoint validated' });
        }

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
            console.log('[Shiprocket Webhook] No order_id in payload, likely a test ping.');
            return NextResponse.json({ success: true, message: 'Test ping received' });
        }

        // Find order by shiprocket_order_id
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('id, status, shipping_address_id')
            .eq('shiprocket_order_id', order_id)
            .single();

        if (orderError || !order) {
            console.warn('[Shiprocket Webhook] Order not found for ID:', order_id);
            // Return 200 even if order not found to satisfy Shiprocket validation
            return NextResponse.json({
                success: true,
                message: 'Webhook received but order not found in our system'
            });
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

                    // Use Template if ID is configured, otherwise fallback to text
                    const templateId = process.env.MSG91_SHIPPED_TEMPLATE_ID;

                    if (templateId) {
                        await WhatsAppService.sendTemplateMessage(address.phone, templateId, {
                            "1": address.name || "Customer",
                            "2": order.id,
                            "3": courier_name || "Courier",
                            "4": trackingLink
                        });
                        console.log('[Shiprocket Webhook] Template tracking notification sent to:', address.phone);
                    } else {
                        const message = `🚚 *Great News!* Your order has been shipped!\n\n` +
                            `📦 *Order ID:* ${order.id}\n` +
                            `🚛 *Courier:* ${courier_name}\n` +
                            `📝 *AWB:* ${awb}\n` +
                            `📍 *Track Order:* ${trackingLink}\n\n` +
                            `${etd ? `📅 *Expected Delivery:* ${etd}\n\n` : ''}` +
                            `Thank you for shopping with us! 🎉`;

                        await WhatsAppService.sendMessage(address.phone, message);
                        console.log('[Shiprocket Webhook] Text tracking notification sent to:', address.phone);
                    }
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
