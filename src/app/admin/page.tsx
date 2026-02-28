"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Loader2,
    Globe,
    AlertTriangle,
    ArrowRight,
    Search,
    MessageSquare,
    CheckCircle
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalSubscribers: 0,
        totalLeads: 0,
        pendingRecoveries: 0,
        revenueByMonth: [] as { name: string, revenue: number }[],
        ordersByStatus: [] as { name: string, value: number }[],
        lowStockProducts: [] as { id: string, name: string, stock: number }[]
    });
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadStats();
    }, []);

    async function loadStats() {
        try {
            const data = await AdminService.getStats();
            setStats(data as any);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleTriggerRecovery() {
        if (!confirm("Start automated WhatsApp recovery for pending leads?")) return;
        setRecoveryLoading(true);
        try {
            const res = await fetch('/api/admin/recovery/trigger', { method: 'POST' });
            const data = await res.json();
            if (data.sent !== undefined) {
                alert(`Recovery sequence completed. Messages sent: ${data.sent}`);
                loadStats();
            } else {
                alert("Failed to run recovery: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert("Error triggering recovery");
        } finally {
            setRecoveryLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const statCards = [
        {
            icon: DollarSign,
            label: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950'
        },
        {
            icon: ShoppingCart,
            label: 'Total Orders',
            value: stats.totalOrders,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950'
        },
        {
            icon: MessageSquare,
            label: 'Total Leads',
            value: stats.totalLeads,
            color: 'text-zinc-600',
            bgColor: 'bg-zinc-100 dark:bg-zinc-800'
        },
        {
            icon: TrendingUp,
            label: 'Avg Order Value',
            value: stats.totalOrders > 0 ? `₹${(stats.totalRevenue / stats.totalOrders).toLocaleString()}` : '₹0',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950'
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Admin <span className="text-primary">Dashboard</span></h1>
                <p className="text-muted-foreground mt-1 font-medium">
                    Analyze your business performance and manage operations.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-2xl font-black">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white border rounded-[2rem] p-5 md:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-xl font-black">Revenue <span className="text-primary">Growth</span></h2>
                            <p className="text-sm text-muted-foreground font-medium">Monthly performance overview</p>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-100 w-fit">
                            Last 6 Months
                        </div>
                    </div>
                    <div className="h-[300px] md:h-[350px]">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueByMonth}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                                        tickFormatter={(v) => `₹${v / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white border rounded-[2rem] p-5 md:p-8 shadow-sm">
                    <h2 className="text-xl font-black mb-1">Order <span className="text-primary">Status</span></h2>
                    <p className="text-sm text-muted-foreground font-medium mb-8">Current fulfillment state</p>
                    <div className="h-[250px] md:h-[300px]">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.ordersByStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.ordersByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="space-y-3 mt-4">
                        {stats.ordersByStatus.map((status, idx) => (
                            <div key={status.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{status.name}</span>
                                </div>
                                <span className="text-sm font-black text-zinc-900">{status.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Quick Actions & Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-zinc-900 text-white rounded-[2rem] p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-black mb-6">Quick <span className="text-primary">Actions</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="/admin/products/new"
                            className="bg-zinc-800 p-6 rounded-2xl hover:bg-zinc-700 transition-all group border border-zinc-700/50"
                        >
                            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary">Add Product</h3>
                            <p className="text-xs text-zinc-400 font-medium">Create a new listing</p>
                        </a>
                        <a
                            href="/admin/orders"
                            className="bg-zinc-800 p-6 rounded-2xl hover:bg-zinc-700 transition-all group border border-zinc-700/50"
                        >
                            <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4">
                                <ShoppingCart className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-blue-500">Manage Orders</h3>
                            <p className="text-xs text-zinc-400 font-medium">Processing & Shipping</p>
                        </a>
                        <button
                            onClick={handleTriggerRecovery}
                            disabled={recoveryLoading}
                            className="bg-zinc-800 p-6 rounded-2xl hover:bg-zinc-700 transition-all group border border-zinc-700/50 text-left disabled:opacity-50"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl w-fit">
                                    <MessageSquare className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-black text-emerald-500">{stats.pendingRecoveries}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pending</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-500">Recover Carts</h3>
                            <p className="text-xs text-zinc-400 font-medium">Trigger WhatsApp sequence</p>
                        </button>
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="bg-white border rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black">Inventory <span className="text-red-500">Alerts</span></h2>
                            <p className="text-sm text-muted-foreground font-medium">Critical stock levels</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {stats.lowStockProducts.length > 0 ? (
                            stats.lowStockProducts.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-200 rounded-xl overflow-hidden flex items-center justify-center text-zinc-400">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 line-clamp-1">{p.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-red-500">Only {p.stock} left in stock</p>
                                        </div>
                                    </div>
                                    <a href={`/admin/products/${p.id}`} className="p-2 hover:bg-white rounded-lg transition-colors">
                                        <ArrowRight className="w-4 h-4 text-zinc-400" />
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="p-4 bg-emerald-50 rounded-full w-fit mx-auto mb-4">
                                    <Package className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="text-sm font-bold text-zinc-900">Inventory Health Good</p>
                                <p className="text-xs text-zinc-500">No critical stock levels found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
