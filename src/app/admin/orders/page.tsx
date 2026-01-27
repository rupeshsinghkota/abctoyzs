"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import { Loader2, Package, Calendar, User, MapPin } from 'lucide-react';

type Order = {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: any[];
    shipping_address?: {
        name: string;
        phone: string;
        address_line1: string;
        address_line2?: string;
        city: string;
        state: string;
        pincode: string;
    };
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const data = await AdminService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(orderId: string, newStatus: string) {
        try {
            await AdminService.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ));
        } catch (error) {
            alert('Failed to update status');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Orders</h1>
                <p className="text-muted-foreground mt-1">Manage customer orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">
                        Orders will appear here once customers make purchases
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-card border rounded-2xl overflow-hidden">
                            {/* Order Header */}
                            <div className="p-6 border-b bg-muted/20">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6 w-full">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                                            <p className="font-mono text-sm font-semibold">{order.id.substring(0, 8)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Date</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <p className="text-sm font-semibold">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-span-2 sm:col-auto border-t sm:border-0 pt-3 sm:pt-0">
                                            <p className="text-xs text-muted-foreground mb-1">Customer</p>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" />
                                                <p className="text-sm font-semibold">
                                                    {order.shipping_address?.name || 'Guest User'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                                        <p className="text-xs text-muted-foreground mb-1">Total</p>
                                        <p className="text-2xl font-bold">${order.total_amount}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Content */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-muted-foreground" />
                                        <p className="font-semibold">{order.items?.length || 0} item(s)</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold text-muted-foreground">Status:</label>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className={`px-4 py-2 rounded-full font-semibold text-sm border-2 outline-none transition-colors ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                                order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}
                                        >
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shipping_address && (
                                    <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            Shipping Details
                                        </h4>
                                        <p className="text-sm font-semibold">{order.shipping_address.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.shipping_address.address_line1}, {order.shipping_address.address_line2 && `${order.shipping_address.address_line2}, `}
                                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                                        </p>
                                        <p className="text-sm font-medium mt-1">📞 {order.shipping_address.phone}</p>
                                    </div>
                                )}

                                {/* Items */}
                                <div className="space-y-3">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                                            <div className="w-16 h-16 bg-background rounded-lg overflow-hidden flex-shrink-0">
                                                {item.product_image && (
                                                    <img
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.product_name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-primary">${item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
