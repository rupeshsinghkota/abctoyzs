"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Loader2
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        try {
            const data = await AdminService.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
            icon: Package,
            label: 'Total Products',
            value: stats.totalProducts,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950'
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
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here's what's happening with your store.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/products/new"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
                    >
                        <Package className="w-6 h-6 text-primary" />
                        <div>
                            <p className="font-semibold">Add New Product</p>
                            <p className="text-xs text-muted-foreground">Create a new listing</p>
                        </div>
                    </a>
                    <a
                        href="/admin/orders"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
                    >
                        <ShoppingCart className="w-6 h-6 text-primary" />
                        <div>
                            <p className="font-semibold">View Orders</p>
                            <p className="text-xs text-muted-foreground">Manage customer orders</p>
                        </div>
                    </a>
                    <a
                        href="/admin/products"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
                    >
                        <TrendingUp className="w-6 h-6 text-primary" />
                        <div>
                            <p className="font-semibold">Manage Inventory</p>
                            <p className="text-xs text-muted-foreground">Update stock levels</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
