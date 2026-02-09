"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import { InvoiceService } from '@/lib/services/invoice';
import {
    Loader2, Package, Calendar, User, MapPin, Search,
    CreditCard, Banknote, ShoppingCart, ChevronRight,
    Download, Truck, Info, CheckCircle2, XCircle, Phone,
    FileText
} from 'lucide-react';

type Order = {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method?: string;
    shipping_carrier?: string;
    tracking_id?: string;
    shiprocket_order_id?: string;
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
            // Automatically add lifecycle timestamps based on status change
            const finalUpdates = { ...updates };
            if (updates.status) {
                const now = new Date().toISOString();
                switch (updates.status) {
                    case 'shipped':
                        (finalUpdates as any).shipped_at = now;
                        break;
                    case 'delivered':
                        (finalUpdates as any).delivered_at = now;
                        break;
                    case 'cancelled':
                        (finalUpdates as any).canceled_at = now;
                        break;
                    case 'returned':
                        (finalUpdates as any).returned_at = now;
                        break;
                    case 'refunded':
                        (finalUpdates as any).refunded_at = now;
                        break;
                }
            }

            await AdminService.updateOrder(orderId, finalUpdates);
            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, ...finalUpdates } : o
            ));
        } catch (error) {
            alert('Failed to update order');
        } finally {
            setUpdating(null);
        }
    }

    const exportToCSV = () => {
        const headers = ["Order ID", "Date", "Customer", "Phone", "Status", "Payment", "Amount", "Method", "Carrier", "AWB", "Shiprocket ID", "Shipped At", "Delivered At", "Refunded Amnt"];
        const rows = filteredOrders.map(o => [
            o.id,
            new Date(o.created_at).toLocaleDateString(),
            o.shipping_address?.name || "Guest",
            o.shipping_address?.phone || "N/A",
            o.status,
            o.payment_status,
            o.total_amount,
            o.payment_method || "PREPAID",
            o.shipping_carrier || "N/A",
            o.tracking_id || "N/A",
            o.shiprocket_order_id || "N/A",
            (o as any).shipped_at ? new Date((o as any).shipped_at).toLocaleString() : "N/A",
            (o as any).delivered_at ? new Date((o as any).delivered_at).toLocaleString() : "N/A",
            (o as any).refunded_amount || "0"
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
            order.shipping_address?.phone.includes(searchTerm) ||
            order.shiprocket_order_id?.toLowerCase().includes(searchTerm.toLowerCase());

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
                    <p className="text-muted-foreground mt-2 font-medium italic">Fulfillment Excellence Powered by D2BCart</p>
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
                            placeholder="Order ID, Phone, or Shiprocket ID..."
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
                        <option value="all">All Statuses</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                        <option value="refunded">Refunded</option>
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
                            <div className="p-8 border-b border-zinc-50 bg-zinc-50/30 group-hover:bg-zinc-100 transition-colors">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white border border-zinc-100 rounded-3xl flex items-center justify-center shadow-sm group-hover:bg-primary transition-colors">
                                            <Package className="w-6 h-6 text-primary group-hover:text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">ID Ref</p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono text-xs font-black text-zinc-600 bg-white border border-zinc-100 px-3 py-1.5 rounded-xl">
                                                    #{order.id.substring(0, 8).toUpperCase()}
                                                </p>
                                                <button
                                                    onClick={() => InvoiceService.generateInvoice(order)}
                                                    className="p-1.5 hover:bg-white rounded-lg text-zinc-400 hover:text-primary transition-colors border border-transparent hover:border-zinc-100"
                                                    title="Download Invoice"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-2">Customer & Time</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-black text-zinc-800">{order.shipping_address?.name || 'Guest'}</p>
                                            <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                                            <p className="text-xs font-bold text-zinc-500 italic">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-2">Payment</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider transition-all shadow-sm ${order.payment_status === 'paid'
                                                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                                                : order.payment_status === 'refunded'
                                                    ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
                                                    : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                                                }`}>
                                                {order.payment_status === 'paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                                                {order.payment_status?.toUpperCase() || 'PENDING'}
                                            </div>
                                            {order.payment_method === 'COD' && (
                                                <div className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest border border-zinc-700">
                                                    COD
                                                </div>
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
                                    <div className="lg:col-span-7 space-y-8">
                                        <div className="flex items-center gap-4 pb-2 border-b border-zinc-50">
                                            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                                <ShoppingCart className="w-4 h-4 text-zinc-800" />
                                            </div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-800">Basket Content</h4>
                                            <span className="ml-auto text-xs font-black text-zinc-400 italic bg-zinc-50 px-3 py-1 rounded-full">{order.items?.length || 0} ITEMS</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {order.items?.map((item: any) => (
                                                <div key={item.id} className="flex items-center gap-6 p-5 bg-zinc-50/30 rounded-[2rem] border border-zinc-50 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all group/item ring-1 ring-transparent hover:ring-zinc-100">
                                                    <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100 p-1 shadow-sm group-hover/item:scale-105 transition-transform duration-500">
                                                        {item.product_image && (
                                                            <img
                                                                src={item.product_image}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-cover rounded-xl"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-zinc-900 group-hover/item:text-primary transition-colors truncate text-lg">{item.product_name}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-[10px] font-black bg-white border border-zinc-100 px-3 py-1.5 rounded-lg text-zinc-500 uppercase tracking-widest">
                                                                QTY <span className="text-zinc-900 ml-1">{item.quantity}</span>
                                                            </span>
                                                            <span className="text-xs font-black text-zinc-200">•</span>
                                                            <span className="text-xs font-bold text-zinc-400 italic">Rate: ₹{item.price.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <p className="font-black text-2xl text-zinc-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Admin Notes */}
                                        <div className="pt-8 border-t border-zinc-50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Info className="w-4 h-4 text-zinc-400" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Internal Audit Notes</h4>
                                            </div>
                                            <textarea
                                                defaultValue={order.admin_notes}
                                                onBlur={(e) => updateOrderDetails(order.id, { admin_notes: e.target.value })}
                                                placeholder="Write internal notes here (e.g., 'Customer requested call before delivery')"
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl p-5 text-sm font-medium placeholder:italic placeholder:text-zinc-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none min-h-[120px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Fulfillment Sidebar */}
                                    <div className="lg:col-span-5 space-y-8">
                                        {/* Status & Tracking Box */}
                                        <div className="bg-zinc-950 text-white rounded-[3rem] p-10 shadow-2xl shadow-zinc-200 ring-8 ring-zinc-50 border border-zinc-800">
                                            <div className="flex items-center justify-between mb-8">
                                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Workflow Control</p>
                                                {order.shiprocket_order_id && (
                                                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                        <span className="text-[9px] font-black text-zinc-400">SR: {order.shiprocket_order_id}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-8">
                                                <div>
                                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block">Fulfillment State</label>
                                                    <div className="relative">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderDetails(order.id, { status: e.target.value })}
                                                            className={`w-full bg-zinc-900 border border-zinc-800 px-7 py-5 rounded-2xl font-black text-sm outline-none cursor-pointer appearance-none transition-all focus:border-primary/50 ${order.status === 'delivered' ? 'text-emerald-400 ring-2 ring-emerald-400/20' :
                                                                order.status === 'shipped' ? 'text-sky-400 ring-2 ring-sky-400/20' :
                                                                    order.status === 'cancelled' || order.status === 'returned' ? 'text-rose-400 ring-2 ring-rose-400/20' :
                                                                        'text-amber-400 ring-2 ring-amber-400/20'
                                                                }`}
                                                        >
                                                            <option value="processing">PROCESSING</option>
                                                            <option value="shipped">SHIPPED / IN TRANSIT</option>
                                                            <option value="delivered">DELIVERED</option>
                                                            <option value="cancelled">CANCELLED</option>
                                                            <option value="returned">RETURNED</option>
                                                            <option value="refunded">REFUNDED</option>
                                                        </select>
                                                        <ChevronRight className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="space-y-6 pt-8 border-t border-zinc-900">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <Truck className="w-4 h-4 text-primary" />
                                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Tracking Logistics</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const carrier = (document.getElementById(`carrier-${order.id}`) as HTMLInputElement)?.value;
                                                                const awb = (document.getElementById(`awb-${order.id}`) as HTMLInputElement)?.value;
                                                                updateOrderDetails(order.id, { shipping_carrier: carrier, tracking_id: awb });
                                                            }}
                                                            className="text-[10px] font-black text-primary hover:text-white transition-colors"
                                                        >
                                                            UPDATE NOW
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="relative group">
                                                            <input
                                                                id={`carrier-${order.id}`}
                                                                type="text"
                                                                placeholder="Carrier Name (e.g. Delhivery)"
                                                                defaultValue={order.shipping_carrier}
                                                                className="w-full bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-xl text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-primary/50 transition-all"
                                                            />
                                                            <label className="absolute -top-2 left-4 px-2 bg-zinc-900 text-[8px] font-black text-zinc-600 transition-colors group-focus-within:text-primary tracking-[0.2em]">CARRIER</label>
                                                        </div>
                                                        <div className="relative group">
                                                            <input
                                                                id={`awb-${order.id}`}
                                                                type="text"
                                                                placeholder="AWB / Air Waybill Number"
                                                                defaultValue={order.tracking_id}
                                                                className="w-full bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-xl text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-primary/50 transition-all font-mono"
                                                            />
                                                            <label className="absolute -top-2 left-4 px-2 bg-zinc-900 text-[8px] font-black text-zinc-600 transition-colors group-focus-within:text-primary tracking-[0.2em]">AWB NUMBER</label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6 pt-8 border-t border-zinc-900">
                                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block">Merchant Actions</label>
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => updateOrderDetails(order.id, { payment_status: order.payment_status === 'paid' ? 'pending' : 'paid' })}
                                                                className={`flex-1 py-4 rounded-2xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 border transition-all ${order.payment_status === 'paid'
                                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                                                    }`}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                {order.payment_status === 'paid' ? 'MARKED PAID' : 'MARK PAID'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const amount = prompt("Enter Refund Amount (₹):", order.total_amount.toString());
                                                                    const refId = prompt("Enter Razorpay Refund ID (if any):", "");
                                                                    if (amount) {
                                                                        updateOrderDetails(order.id, {
                                                                            status: 'refunded',
                                                                            payment_status: 'refunded',
                                                                            refunded_amount: parseFloat(amount),
                                                                            razorpay_refund_id: refId || ''
                                                                        } as any);
                                                                    }
                                                                }}
                                                                className="flex-1 py-4 rounded-2xl text-[10px] font-black tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                                REFUND
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => InvoiceService.generateInvoice(order)}
                                                            className="w-full py-4 rounded-2xl text-[10px] font-black tracking-widest bg-primary text-white hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            GENERATE & DOWNLOAD INVOICE
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Card */}
                                        {order.shipping_address && (
                                            <div className="bg-white border-2 border-zinc-100 rounded-[3rem] p-10 shadow-sm hover:ring-8 hover:ring-zinc-50 transition-all duration-500 ring ring-transparent">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                                        <MapPin className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Destination</h4>
                                                        <p className="text-xl font-black text-zinc-900">Shipping Info</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-xl font-black text-zinc-900">{order.shipping_address.name}</p>
                                                    <p className="text-base font-medium text-zinc-500 leading-relaxed uppercase tracking-tight text-xs">
                                                        {order.shipping_address.address_line1}
                                                        {order.shipping_address.address_line2 && <>, <br />{order.shipping_address.address_line2}</>}
                                                        <br />
                                                        {order.shipping_address.city}, {order.shipping_address.state}
                                                        <br />
                                                        <span className="font-extrabold text-zinc-900 text-lg tracking-widest">{order.shipping_address.pincode}</span>
                                                    </p>
                                                </div>
                                                <div className="mt-10 pt-8 border-t border-zinc-50 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] mb-2">Direct Reach</p>
                                                        <p className="text-lg font-black text-zinc-900 tracking-tighter">{order.shipping_address.phone}</p>
                                                    </div>
                                                    <a
                                                        href={`tel:${order.shipping_address.phone}`}
                                                        className="h-14 w-14 bg-zinc-950 text-white hover:bg-primary rounded-full flex items-center justify-center transition-all shadow-2xl shadow-zinc-200 hover:scale-110 active:scale-95 group"
                                                    >
                                                        <Phone className="w-5 h-5 group-hover:animate-bounce" />
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
