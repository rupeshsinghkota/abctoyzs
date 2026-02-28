"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import {
    Loader2, Search, Download, Filter, ChevronRight,
    ArrowUpDown, Eye, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
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
        <div className="max-w-[1600px] mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground text-sm">Manage and fulfill your customer orders.</p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                        Create Order
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer, phone..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative group w-full sm:w-auto">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <select
                            className="w-full sm:w-48 pl-9 pr-4 py-2 rounded-lg border text-sm appearance-none bg-white cursor-pointer hover:border-zinc-300 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b text-xs uppercase font-medium text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 tracking-wider">Order</th>
                                <th className="px-6 py-3 tracking-wider">Date</th>
                                <th className="px-6 py-3 tracking-wider">Customer</th>
                                <th className="px-6 py-3 tracking-wider">Total</th>
                                <th className="px-6 py-3 tracking-wider">Payment</th>
                                <th className="px-6 py-3 tracking-wider">Fulfillment</th>
                                <th className="px-6 py-3 tracking-wider">Items</th>
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
                                        <td className="px-6 py-4 font-medium text-zinc-900">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleDateString()}
                                            <span className="text-xs ml-1 text-zinc-400">
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900">{order.shipping_address?.name || 'Guest'}</div>
                                            <div className="text-xs text-muted-foreground">{order.shipping_address?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-zinc-900">
                                            ₹{order.total_amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
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
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
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
