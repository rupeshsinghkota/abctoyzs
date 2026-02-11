"use client";

import { useEffect, useState } from 'react';
import { Package, ArrowLeft, Loader2, Calendar, Truck, CheckCircle, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { OrderService, Order } from '@/lib/services/orders';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const data = await OrderService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateMock() {
        setCreating(true);
        try {
            await OrderService.createMockOrder();
            loadOrders();
        } catch (e) {
            alert('Failed to create order. Make sure database schema is applied.');
        } finally {
            setCreating(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/profile" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold">My Orders</h1>
                </div>
                {/* Temp Button for testing */}
                <button
                    onClick={handleCreateMock}
                    disabled={creating}
                    className="text-xs flex items-center gap-1 bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-full font-medium transition-colors"
                >
                    {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Test Order
                </button>
            </div>

            <div className="p-4 max-w-4xl mx-auto space-y-6">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                            <Package className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                        <p className="text-muted-foreground mb-8 max-w-sm">
                            Looks like you haven't bought any toys yet. Start shopping to fill your garage!
                        </p>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <Link href={`/orders/${order.id}`} key={order.id} className="block bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            {/* Order Header */}
                            <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group-hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Order #{order.id.slice(0, 8)}</p>
                                        <div className="flex items-center gap-1.5 text-sm font-medium mt-0.5">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Amount</p>
                                        <p className="font-bold text-lg leading-tight">₹{order.total_amount.toLocaleString()}</p>
                                    </div>
                                    {order.payment_method === 'COD' && (
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Payment</p>
                                            <div className="flex flex-col items-end leading-tight">
                                                <span className="text-xs font-medium text-green-600">Paid: ₹500</span>
                                                <span className="text-xs font-bold text-red-500">Due: ₹{(order.total_amount - 500).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items Preview */}
                            <div className="p-4">
                                <div className="space-y-4">
                                    {order.items?.slice(0, 2).map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-16 h-16 bg-muted rounded-xl relative overflow-hidden flex-shrink-0 border">
                                                {item.product_image && (
                                                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <h3 className="font-bold text-sm line-clamp-1">{item.product_name}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                                    <span className="font-medium text-primary">₹{item.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {order.items && order.items.length > 2 && (
                                    <div className="mt-3 text-xs font-medium text-muted-foreground pl-20">
                                        + {order.items.length - 2} more items...
                                    </div>
                                )}
                            </div>

                            {/* Footer Status */}
                            <div className="px-4 py-3 bg-muted/10 border-t flex flex-row items-center justify-between gap-4">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                    }`}>
                                    {order.status === 'delivered' ? <CheckCircle className="w-3.5 h-3.5" /> :
                                        order.status === 'shipped' ? <Truck className="w-3.5 h-3.5" /> :
                                            <Clock className="w-3.5 h-3.5" />}
                                    {order.status}
                                </div>

                                <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                    View Details <ArrowLeft className="w-3 h-3 rotate-180" />
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
