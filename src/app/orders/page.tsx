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

            <div className="p-4 max-w-2xl mx-auto space-y-4">
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
                        <div key={order.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                            {/* Order Header */}
                            <div className="p-4 border-b bg-muted/20 flex flex-wrap gap-4 items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Order Placed</p>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total</p>
                                    <p className="font-bold text-lg">₹{order.total_amount}</p>
                                    {order.payment_method === 'COD' && (
                                        <div className="mt-1 text-xs text-right">
                                            <p className="text-green-600 font-medium">Paid: ₹500</p>
                                            <p className="text-red-600 font-bold">Due: ₹{order.total_amount - 500}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Status */}
                            <div className="px-4 py-3 bg-primary/5 flex items-center gap-2">
                                {order.status === 'delivered' ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : order.status === 'shipped' ? (
                                    <Truck className="w-4 h-4 text-blue-600" />
                                ) : (
                                    <Clock className="w-4 h-4 text-orange-600" />
                                )}
                                <span className="text-sm font-bold capitalize text-primary">
                                    Status: {order.status}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="p-4 space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-20 h-20 bg-muted rounded-xl relative overflow-hidden flex-shrink-0">
                                            {item.product_image && (
                                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-sm md:text-base line-clamp-2">{item.product_name}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                            <p className="font-bold text-primary mt-1">₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
