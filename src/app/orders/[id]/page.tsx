"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { OrderService, Order } from '@/lib/services/orders';
import { ArrowLeft, MapPin, Package, CreditCard, HelpCircle, Truck, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadOrder();
    }, [id]);

    async function loadOrder() {
        try {
            const data = await OrderService.getOrderById(id);
            if (!data) {
                setError("Order not found");
                return;
            }
            setOrder(data);
        } catch (error: any) {
            console.error("Order load error:", error);
            setError(error.message || "Failed to load order");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <XCircle className="w-12 h-12 text-destructive mb-4" />
                <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
                <p className="text-muted-foreground mb-2">{error}</p>
                <div className="bg-muted p-2 rounded text-xs font-mono mb-6 text-left max-w-sm overflow-auto">
                    <p>Order ID: {id}</p>
                    <p>Time: {new Date().toISOString()}</p>
                </div>
                <Link
                    href="/orders"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </Link>
            </div>
        );
    }

    if (!order) return null;

    const isCOD = order.payment_method === 'COD';
    // Use stored advance_amount if available, otherwise fallback to 0 (or legacy 500 if needed, but 0 is safer default)
    // Actually, distinct between prepaid and COD.
    // If COD, paidAmount is advance_amount.
    // If Prepaid, paidAmount is total_amount.

    // We need to extend Order type to include advance_amount in this file first, but let's assume it comes from API.
    // If not in type, we cast or add it.
    const advancePaid = (order as any).advance_amount || 0;
    const dueAmount = isCOD ? order.total_amount - advancePaid : 0;
    const paidAmount = isCOD ? advancePaid : order.total_amount;

    // Derive tracking link (Generic Shiprocket tracking or similar)
    const trackingLink = order.shiprocket_order_id ? `#` : null; // Replace with actual tracking URL pattern if known

    return (
        <div className="min-h-screen pb-24 bg-zinc-50/50">
            {/* Premium Compact Header with Back Button */}
            <div className="bg-zinc-900 pt-8 pb-16 -mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                <div className="max-w-3xl mx-auto px-6 relative z-10 flex items-center gap-4">
                    <Link href="/orders" className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 backdrop-blur-sm group">
                        <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Order #{order.id.slice(0, 8)}</h1>
                        <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-6 relative z-20">

                {/* Status Card */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold flex items-center gap-2">
                            <Truck className="w-5 h-5 text-primary" />
                            Order Status
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'}`}>
                            {order.status}
                        </span>
                    </div>
                    {/* Add basic progress Steps here if needed */}
                    <p className="text-sm text-muted-foreground">
                        {order.status === 'processing' ? 'We have received your order and are preparing it for shipment.' :
                            order.status === 'shipped' ? 'Your order is on the way!' :
                                order.status === 'delivered' ? 'Package delivered.' :
                                    'This order has been cancelled.'}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {order.shiprocket_order_id && (
                            <button className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <Truck className="w-4 h-4" />
                                Track Order
                            </button>
                        )}
                        <a
                            href={`https://wa.me/918239269217?text=Help with Order ID: ${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Need Help?
                        </a>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-muted/30 border-b">
                        <h3 className="font-bold flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Items
                        </h3>
                    </div>
                    <div className="divide-y">
                        {order.items?.map((item) => (
                            <div key={item.id} className="p-4 flex gap-4">
                                <div className="w-20 h-20 bg-muted rounded-xl relative overflow-hidden flex-shrink-0">
                                    {item.product_image && (
                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">{item.product_name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity} x ₹{item.price}</p>
                                    <p className="font-bold text-primary mt-1">₹{item.price * item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping & Payment Info Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4 text-primary" />
                            Shipping Address
                        </h3>
                        {/* Note: Addresses might need to be joined or fetched. Assuming shipping_address_id is resolved or address is stored in order json if flattened. 
                            If 'shipping_address' is joined in fetch, we use it. 
                            Let's check if fetch returns strict Order type or joined. 
                            The service returns Order, which just has IDs often. 
                            We might need to update OrderService.getOrderById to fetch address relation.
                            For now, assuming it's fetched or displaying ID if not (will fix if needed).
                        */}
                        {/* UPDATE: OrderService.getOrderById does NOT currently join address. I should update it. 
                            Propagating address check... */}
                        <div className="text-sm text-muted-foreground space-y-1">
                            {/* @ts-ignore - address is joined */}
                            {order.shipping_address ? (
                                <>
                                    {/* @ts-ignore */}
                                    <p className="font-medium text-foreground">{order.shipping_address.name}</p>
                                    {/* @ts-ignore */}
                                    <p>{order.shipping_address.address_line1}</p>
                                    {/* @ts-ignore */}
                                    {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                    <p>
                                        {/* @ts-ignore */}
                                        {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                                    </p>
                                    {/* @ts-ignore */}
                                    <p>{order.shipping_address.phone}</p>
                                </>
                            ) : (
                                <p className="text-yellow-600 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Address details missing
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Payment Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{order.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                                <span>Total Amount</span>
                                <span>₹{order.total_amount}</span>
                            </div>

                            {isCOD && (
                                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mt-4 text-xs space-y-1">
                                    <div className="flex justify-between font-medium">
                                        <span>Paid Online (Advance)</span>
                                        <span className="text-green-600">- ₹{paidAmount}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-sm border-t border-yellow-200 pt-1 mt-1">
                                        <span>Due on Delivery</span>
                                        <span className="text-red-600">₹{dueAmount}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
