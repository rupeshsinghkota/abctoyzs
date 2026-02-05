"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import {
    Loader2, Package, Calendar, User, MapPin, Search,
    CreditCard, Banknote, ShoppingCart, ChevronRight,
    Download, Truck, Info, CheckCircle2, XCircle
} from 'lucide-react';

type Order = {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    payment_status: string;
    shipping_carrier?: string;
    tracking_id?: string;
    admin_notes?: string;
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);

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

    async function updateOrderDetails(orderId: string, updates: Partial<Order>) {
        setUpdating(orderId);
        try {
            await AdminService.updateOrder(orderId, updates);
            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, ...updates } : o
            ));
        } catch (error) {
            alert('Failed to update order');
        } finally {
            setUpdating(null);
        }
    }

    const exportToCSV = () => {
        const headers = ["Order ID", "Date", "Customer", "Phone", "Status", "Payment", "Amount", "Carrier", "Tracking"];
        const rows = filteredOrders.map(o => [
            o.id,
            new Date(o.created_at).toLocaleDateString(),
            o.shipping_address?.name || "Guest",
            o.shipping_address?.phone || "N/A",
            o.status,
            o.payment_status,
            o.total_amount,
            o.shipping_carrier || "N/A",
            o.tracking_id || "N/A"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_address?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_address?.phone.includes(searchTerm);

        const matchesFilter = filterStatus === 'all' || order.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-400 bg-clip-text text-transparent tracking-tighter">
                        Order Hub
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Empowering your fulfillment workflow</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-bold hover:bg-zinc-50 transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4 text-zinc-600" />
                        Export CSV
                    </button>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Find an order..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-5 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none w-full md:w-80 transition-all shadow-sm font-medium"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-5 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:border-zinc-300 transition-all shadow-sm"
                    >
                        <option value="all">All Orders</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-32 bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-[3rem]">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-zinc-200/50">
                        <Package className="w-12 h-12 text-zinc-300" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-800 mb-3">No matching orders</h3>
                    <p className="text-zinc-500 font-medium">Your filters didn't return any results.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="group bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 ring-1 ring-zinc-50">
                            {/* Card Header: Summary Info */}
                            <div className="p-8 border-b border-zinc-50 bg-zinc-50/30 group-hover:bg-zinc-50 transition-colors">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white border border-zinc-100 rounded-3xl flex items-center justify-center shadow-sm">
                                            <Package className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">ID Ref</p>
                                            <p className="font-mono text-xs font-black text-zinc-600 bg-white border border-zinc-100 px-3 py-1.5 rounded-xl">
                                                #{order.id.substring(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-2">Customer & Time</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-black text-zinc-800">{order.shipping_address?.name || 'Guest'}</p>
                                            <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                                            <p className="text-xs font-bold text-zinc-500 italic">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-2">Payment Status</p>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider transition-all shadow-sm ${order.payment_status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                                                    : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                                                }`}>
                                                {order.payment_status === 'paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                                                {order.payment_status?.toUpperCase() || 'PENDING'}
                                            </div>
                                            {order.payment_status !== 'paid' && (
                                                <button
                                                    onClick={() => updateOrderDetails(order.id, { payment_status: 'paid' })}
                                                    className="text-[10px] font-black text-primary hover:underline"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end text-right">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Net Amount</p>
                                            <p className="text-4xl font-black text-primary tracking-tighter">₹{order.total_amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body: Details & Actions */}
                            <div className="p-10">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                    {/* Items List */}
                                    <div className="lg:col-span-7 space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-zinc-50">
                                            <ShoppingCart className="w-5 h-5 text-zinc-800" />
                                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-800">Basket Content</h4>
                                            <span className="ml-auto text-xs font-bold text-zinc-400">{order.items?.length || 0} Products</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {order.items?.map((item: any) => (
                                                <div key={item.id} className="flex items-center gap-6 p-5 bg-zinc-50/20 rounded-[2rem] border border-zinc-50 hover:bg-white hover:shadow-lg hover:shadow-zinc-200/30 transition-all group/item">
                                                    <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100 p-1 shadow-sm group-hover/item:scale-105 transition-transform">
                                                        {item.product_image && (
                                                            <img
                                                                src={item.product_image}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-cover rounded-xl"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-extrabold text-zinc-900 group-hover/item:text-primary transition-colors truncate">{item.product_name}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-xs font-bold bg-white border border-zinc-100 px-3 py-1 rounded-lg text-zinc-500">
                                                                Qty: <span className="text-zinc-900">{item.quantity}</span>
                                                            </span>
                                                            <span className="text-xs font-black text-zinc-300">|</span>
                                                            <span className="text-xs font-bold text-zinc-400 italic">Unit: ₹{item.price.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <p className="font-black text-xl text-zinc-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fulfillment Sidebar */}
                                    <div className="lg:col-span-5 space-y-8">
                                        {/* Status & Tracking Box */}
                                        <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-zinc-200 ring-4 ring-zinc-50">
                                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-6">Workflow Management</p>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-xs font-black text-zinc-400 mb-3 block">Fulfillment Status</label>
                                                    <div className="relative">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderDetails(order.id, { status: e.target.value })}
                                                            className={`w-full bg-zinc-800 border-none px-6 py-4 rounded-[1.25rem] font-black text-sm outline-none cursor-pointer appearance-none transition-all ${order.status === 'delivered' ? 'text-emerald-400' :
                                                                    order.status === 'shipped' ? 'text-sky-400' :
                                                                        order.status === 'cancelled' ? 'text-rose-400' :
                                                                            'text-amber-400'
                                                                }`}
                                                        >
                                                            <option value="processing">PROCESSING</option>
                                                            <option value="shipped">SHIPPED</option>
                                                            <option value="delivered">DELIVERED</option>
                                                            <option value="cancelled">CANCELLED</option>
                                                        </select>
                                                        <ChevronRight className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                                                    </div>
                                                </div>

                                                {(order.status === 'shipped' || order.status === 'delivered' || order.tracking_id) && (
                                                    <div className="space-y-4 pt-4 border-t border-zinc-800">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <Truck className="w-5 h-5 text-primary" />
                                                            <p className="text-xs font-black uppercase text-zinc-200 tracking-widest">Tracking Logistics</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Carrier (Delhivery...)"
                                                                defaultValue={order.shipping_carrier}
                                                                onBlur={(e) => updateOrderDetails(order.id, { shipping_carrier: e.target.value })}
                                                                className="bg-zinc-800 border-none px-5 py-3.5 rounded-xl text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Tracking ID #"
                                                                defaultValue={order.tracking_id}
                                                                onBlur={(e) => updateOrderDetails(order.id, { tracking_id: e.target.value })}
                                                                className="bg-zinc-800 border-none px-5 py-3.5 rounded-xl text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Address Card */}
                                        {order.shipping_address && (
                                            <div className="bg-white border-2 border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                                        <MapPin className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-800">Destination</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-lg font-black text-zinc-900">{order.shipping_address.name}</p>
                                                    <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                                        {order.shipping_address.address_line1}, {order.shipping_address.address_line2 && `${order.shipping_address.address_line2}, `}
                                                        <br />
                                                        {order.shipping_address.city}, {order.shipping_address.state} - <span className="font-extrabold text-zinc-800">{order.shipping_address.pincode}</span>
                                                    </p>
                                                </div>
                                                <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-zinc-300 tracking-tighter mb-1">Direct Line</p>
                                                        <p className="text-sm font-black text-zinc-900">{order.shipping_address.phone}</p>
                                                    </div>
                                                    <a
                                                        href={`tel:${order.shipping_address.phone}`}
                                                        className="px-6 py-3 bg-zinc-900 text-white hover:bg-primary rounded-2xl text-[10px] font-black transition-all shadow-xl shadow-zinc-200"
                                                    >
                                                        DIAL NOW
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
