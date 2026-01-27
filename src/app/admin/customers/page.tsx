"use client";

import { useEffect, useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import { Loader2, User, Phone, ShoppingBag, Calendar, TrendingUp } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        try {
            const data = await AdminService.getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading customer data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Customers</h1>
                    <p className="text-muted-foreground mt-1">
                        {customers.length} total unique customers (derived from orders)
                    </p>
                </div>

                {/* Summary Pill */}
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Top Spender: ${customers.length > 0 ? Math.max(...customers.map(c => c.totalSpent)).toLocaleString() : '0'}
                </div>
            </div>

            {customers.length === 0 ? (
                <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No customers yet</h3>
                    <p className="text-muted-foreground">
                        Customer profiles will appear here once orders are placed.
                    </p>
                </div>
            ) : (
                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Customer</th>
                                    <th className="text-left p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Contact</th>
                                    <th className="text-left p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Orders</th>
                                    <th className="text-left p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Total Spent</th>
                                    <th className="text-right p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <span className="font-bold">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-2 text-sm text-foreground">
                                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                                    {customer.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-lg text-sm font-semibold">
                                                <ShoppingBag className="w-3 h-3" />
                                                {customer.totalOrders}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-green-600 dark:text-green-400 font-bold">
                                                ${customer.totalSpent.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(customer.lastOrderDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
