"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import { InvoiceService } from '@/lib/services/invoice';
import {
    Loader2, ArrowLeft, MoreHorizontal, Printer, MapPin,
    Mail, Phone, Package, Truck, CreditCard, Calendar,
    CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// ShippingModal removed - orders auto-sync to Shiprocket on payment

type Order = {
    id: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method?: string;
    shipping_carrier?: string;
    tracking_id?: string;
    shiprocket_order_id?: string;
    shipment_id?: string;
    awb?: string;
    courier_id?: number;
    courier_name?: string;
    pickup_scheduled_date?: string;
    admin_notes?: string;
    created_at: string;
    razorpay_order_id?: string;
    items: any[];
    shipping_address?: {
        name: string;
        phone: string;
        address_line1: string;
        address_line2?: string;
        city: string;
        state: string;
        pincode: string;
        email?: string;
    };
    guest_email?: string;
};

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    // Modal removed - simplified workflow

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    async function loadOrder() {
        try {
            // We reuse the list fetch or fetch single if available.
            // Since getAllOrders fetches everything, let's optimize later.
            // For now, we fetch all and find (or better, add getOrderById to AdminService if missing).
            // Actually, we should fetch single. Let's assume AdminService has getOrderById or we use getAllOrders logic.
            // Checking existing code, AdminService.getAllOrders is what we used.
            // Let's stick to getAllOrders for now to be safe, or add a single fetch if we can.
            // Ideally: const data = await AdminService.getOrderById(orderId);
            const allOrders = await AdminService.getAllOrders();
            const found = allOrders.find((o: any) => o.id === orderId);
            setOrder(found || null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateOrder(updates: Partial<Order>) {
        if (!order) return;
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update order');
            }

            const { data } = await response.json();
            setOrder({ ...order, ...updates });
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update order');
        } finally {
            setUpdating(false);
        }
    }

    // Manual shipping functions removed - orders auto-sync on payment

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    const email = order.guest_email || order.shipping_address?.email || "No email provided";

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 hover:bg-zinc-100 rounded-full text-muted-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${order.payment_status === 'paid' ? 'bg-zinc-900 text-white border-zinc-900' :
                                'bg-amber-100 text-amber-700 border-amber-200'
                                }`}>
                                {order.payment_status}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                'bg-zinc-100 text-zinc-700 border-zinc-200'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => InvoiceService.generateInvoice(order)}
                        className="px-3 py-2 text-sm font-medium border rounded-lg bg-white hover:bg-zinc-50 transition-colors flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Print Invoice
                    </button>
                    {order.payment_status === 'paid' && (
                        <button
                            onClick={() => {
                                const amount = prompt("Refund Amount (₹):", order.total_amount.toString());
                                if (amount) updateOrder({ status: 'refunded', payment_status: 'refunded' });
                            }}
                            className="px-3 py-2 text-sm font-medium border rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors flex items-center gap-2"
                        >
                            Refund
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left Column (Main) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Items Card */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b px-6 py-4 bg-zinc-50/50">
                            <h2 className="font-semibold text-sm">Order Items</h2>
                        </div>
                        <div className="divide-y">
                            {order.items.map((item: any, i) => (
                                <div key={i} className="flex gap-4 p-6">
                                    <div className="w-16 h-16 bg-zinc-100 rounded-lg border overflow-hidden flex-shrink-0">
                                        {item.product_image && (
                                            <img src={item.product_image} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sm text-zinc-900">{item.product_name}</p>
                                                <p className="text-sm text-muted-foreground mt-1">SKU: {item.product_id || 'N/A'}</p>
                                            </div>
                                            <p className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            {item.price.toLocaleString()} x {item.quantity}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t bg-zinc-50/50 p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{order.total_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>Free</span>
                            </div>

                            {/* COD Breakdown */}
                            {order.payment_method === 'COD' && (
                                <>
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Prepaid (Online)</span>
                                        <span>- ₹500</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium border-t border-dashed pt-2 mt-1">
                                        <span>To Collect (COD)</span>
                                        <span>₹{(order.total_amount - 500).toLocaleString()}</span>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between font-bold text-base pt-3 border-t">
                                <span>Total Order Value</span>
                                <span>₹{order.total_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                <span>Paid by {order.payment_method}</span>
                                {order.payment_method === 'COD' && order.payment_status === 'partially_paid' && (
                                    <span className="text-amber-600 font-medium ml-2">Prepaid ₹500 received</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fulfillment Card */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b px-6 py-4 bg-zinc-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-sm">Fulfillment</h2>
                            {updating && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Carrier</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={order.shipping_carrier || ''}
                                        onChange={(e) => updateOrder({ shipping_carrier: e.target.value })}
                                    >
                                        <option value="">Select Carrier...</option>
                                        <option value="Delhivery">Delhivery</option>
                                        <option value="BlueDart">BlueDart</option>
                                        <option value="DTDC">DTDC</option>
                                        <option value="Shiprocket">Shiprocket</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tracking #</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                        placeholder="AWB Number"
                                        value={order.tracking_id || ''}
                                        onBlur={(e) => updateOrder({ tracking_id: e.target.value })}
                                        onChange={(e) => setOrder({ ...order, tracking_id: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</label>
                                <div className="flex gap-2">
                                    {['processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateOrder({ status: s })}
                                            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${order.status === s
                                                ? 'bg-zinc-900 text-white border-zinc-900'
                                                : 'bg-white text-zinc-600 hover:bg-zinc-50'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Shiprocket Tracking Info */}
                            {order.shiprocket_order_id ? (
                                <div className="pt-4 border-t">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package className="w-5 h-5 text-blue-600" />
                                            <h4 className="font-semibold text-blue-900">Shiprocket Tracking</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Order ID:</span>
                                                <a
                                                    href={`https://app.shiprocket.in/seller/orders/details/${order.shiprocket_order_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline font-medium"
                                                >
                                                    {order.shiprocket_order_id}
                                                </a>
                                            </div>
                                            {order.awb && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">AWB:</span>
                                                    <span className="font-medium">{order.awb}</span>
                                                </div>
                                            )}
                                            {order.courier_name && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Courier:</span>
                                                    <span className="font-medium">{order.courier_name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            <p className="text-xs text-blue-700">
                                                💡 Manage courier selection and tracking in Shiprocket dashboard
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-4 border-t">
                                    <div className="bg-yellow-50 rounded-lg p-3">
                                        <p className="text-sm text-yellow-800">
                                            ℹ️ Order will automatically sync to Shiprocket once payment is confirmed
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    {/* Notes */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b px-6 py-4 bg-zinc-50/50">
                            <h2 className="font-semibold text-sm">Notes</h2>
                        </div>
                        <div className="p-4">
                            <textarea
                                className="w-full min-h-[100px] p-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                placeholder="Add note..."
                                defaultValue={order.admin_notes || ''}
                                onBlur={(e) => updateOrder({ admin_notes: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b px-6 py-4 bg-zinc-50/50">
                            <h2 className="font-semibold text-sm">Customer</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {order.shipping_address ? (
                                {order.shipping_address ? (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {order.shipping_address.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-zinc-900">{order.shipping_address.name}</p>
                                            <p className="text-zinc-500">No prior orders</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex items-center gap-3 text-sm text-zinc-600">
                                            <Mail className="w-4 h-4 text-zinc-400" />
                                            <a href={`mailto:${email}`} className="hover:text-primary transition-colors truncate">
                                                {email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-zinc-600">
                                            <Phone className="w-4 h-4 text-zinc-400" />
                                            <a href={`tel:${order.shipping_address.phone}`} className="hover:text-primary transition-colors">
                                                {order.shipping_address.phone}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <div className="flex items-start gap-3 text-sm text-zinc-600">
                                            <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                                            <div className="leading-relaxed">
                                                <p>{order.shipping_address.address_line1}</p>
                                                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                                                <p>{order.shipping_address.pincode}</p>
                                                <p className="mt-1 font-medium">India</p>
                                            </div>
                                        </div>
                                    </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No address details</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
        </div>
    );
}
