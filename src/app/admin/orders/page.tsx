"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import {
    Loader2, Search, Download, Filter, ChevronRight,
    ArrowUpDown, Eye, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Order = {
    id: string;
    total_amount: number;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
    payment_status: 'paid' | 'pending' | 'refunded' | 'failed' | 'paid_advance' | 'partially_paid';
    payment_method?: string;
    created_at: string;
    items: any[];
    shipping_address?: {
        name: string;
        phone: string;
    };
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const router = useRouter();

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

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_address?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_address?.phone.includes(searchTerm);

        const matchesFilter = filterStatus === 'all' || order.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled':
            case 'returned': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'paid_advance':
            case 'partially_paid': return 'bg-zinc-900 text-zinc-100';
            case 'pending': return 'bg-zinc-100 text-zinc-600';
            case 'refunded': return 'bg-zinc-200 text-zinc-600 line-through';
            default: return 'bg-zinc-100 text-zinc-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Orders</h1>
                    <p className="text-zinc-500 text-sm font-medium">Manage and fulfill your customer orders.</p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm shadow-zinc-200">
                        Create Order
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer, phone..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                filterStatus === status
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                    : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b text-xs uppercase font-medium text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 tracking-wider">Order</th>
                                <th className="px-6 py-3 tracking-wider hidden sm:table-cell">Date</th>
                                <th className="px-6 py-3 tracking-wider">Customer</th>
                                <th className="px-6 py-3 tracking-wider">Total</th>
                                <th className="px-6 py-3 tracking-wider hidden lg:table-cell">Payment</th>
                                <th className="px-6 py-3 tracking-wider hidden md:table-cell">Fulfillment</th>
                                <th className="px-6 py-3 tracking-wider hidden xl:table-cell">Items</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                                        No orders found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                    >
                                        <td className="px-6 py-4 font-medium text-zinc-900 whitespace-nowrap">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap hidden sm:table-cell text-xs">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900 truncate max-w-[120px] sm:max-w-none">{order.shipping_address?.name || 'Guest'}</div>
                                            <div className="text-xs text-muted-foreground hidden sm:block">{order.shipping_address?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-zinc-900">
                                            ₹{order.total_amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentStatusColor(order.payment_status)}`}>
                                                {order.payment_status === 'paid' || order.payment_status === 'paid_advance' || order.payment_status === 'partially_paid' ? 'Paid' :
                                                    order.payment_status === 'refunded' ? 'Refunded' : 'Pending'}
                                            </span>
                                            {order.payment_method === 'COD' && (
                                                <span className="ml-2 text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">COD</span>
                                            )}
                                            {order.payment_method === 'BOOKING' && (
                                                <span className="ml-2 text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">Video Call</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground hidden xl:table-cell">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Visual only for now) */}
                <div className="px-6 py-4 border-t bg-zinc-50 flex items-center justify-between text-xs text-muted-foreground">
                    <div>Showing {filteredOrders.length} orders</div>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 border rounded bg-white hover:bg-zinc-50 disabled:opacity-50">Previous</button>
                        <button disabled className="px-3 py-1 border rounded bg-white hover:bg-zinc-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
