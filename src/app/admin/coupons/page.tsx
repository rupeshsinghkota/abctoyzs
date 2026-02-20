"use client";

import { useEffect, useState } from 'react';
import { AdminService, Coupon } from '@/lib/services/admin';
import {
    Plus, Loader2, Trash2, Ticket, Calendar,
    CheckCircle2, XCircle, ChevronRight, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        min_order_amount: '0',
        max_discount: '',
        usage_limit: '',
        expires_at: '',
        allowed_payment_method: 'ALL'
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    async function loadCoupons() {
        setLoading(true);
        try {
            const data = await AdminService.getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await AdminService.createCoupon({
                ...newCoupon,
                discount_value: Number(newCoupon.discount_value),
                min_order_amount: Number(newCoupon.min_order_amount),
                max_discount: newCoupon.max_discount ? Number(newCoupon.max_discount) : undefined,
                usage_limit: newCoupon.usage_limit ? Number(newCoupon.usage_limit) : undefined,
                expires_at: newCoupon.expires_at ? new Date(newCoupon.expires_at).toISOString() : undefined,
            } as any);
            setIsCreating(false);
            setNewCoupon({
                code: '',
                discount_type: 'PERCENTAGE',
                discount_value: '',
                min_order_amount: '0',
                max_discount: '',
                usage_limit: '',
                expires_at: '',
                allowed_payment_method: 'ALL'
            });
            loadCoupons();
        } catch (error) {
            alert('Failed to create coupon. Check if code already exists.');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await AdminService.deleteCoupon(id);
            setCoupons(coupons.filter(c => c.id !== id));
        } catch (error) {
            alert('Failed to delete coupon');
        }
    }

    async function toggleStatus(coupon: Coupon) {
        try {
            await AdminService.updateCoupon(coupon.id, { is_active: !coupon.is_active });
            setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
        } catch (error) {
            alert('Failed to update status');
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Ticket className="w-10 h-10 text-primary" />
                        Coupons
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage discount codes and promotional offers
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="group flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Create New Coupon
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground font-medium">Fetching active coupons...</p>
                </div>
            ) : coupons.length === 0 && !isCreating ? (
                <div className="text-center py-24 bg-card border border-dashed rounded-3xl">
                    <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No coupons yet</h3>
                    <p className="text-muted-foreground mb-8">Start by creating your first promotional code</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl"
                    >
                        Create Coupon
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create Form Card */}
                    {isCreating && (
                        <div className="bg-card border-2 border-primary/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="bg-primary/10 p-4 border-b border-primary/20 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> New Coupon
                                </h3>
                                <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-5 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Code</label>
                                    <input
                                        required
                                        placeholder="e.g. WELCOME10"
                                        className="w-full p-3 rounded-xl border bg-background font-black uppercase text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={newCoupon.code}
                                        onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Type</label>
                                        <select
                                            className="w-full p-3 rounded-xl border bg-background text-sm outline-none"
                                            value={newCoupon.discount_type}
                                            onChange={e => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                                        >
                                            <option value="PERCENTAGE">% Percentage</option>
                                            <option value="FIXED">₹ Fixed Amount</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Value</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder={newCoupon.discount_type === 'PERCENTAGE' ? '10' : '500'}
                                            className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={newCoupon.discount_value}
                                            onChange={e => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Min Order</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full p-3 rounded-xl border bg-background text-sm outline-none"
                                            value={newCoupon.min_order_amount}
                                            onChange={e => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Max Disc.</label>
                                        <input
                                            type="number"
                                            placeholder="None"
                                            className="w-full p-3 rounded-xl border bg-background text-sm outline-none"
                                            value={newCoupon.max_discount}
                                            onChange={e => setNewCoupon({ ...newCoupon, max_discount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 rounded-xl border bg-background text-sm outline-none"
                                            value={newCoupon.expires_at}
                                            onChange={e => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Payment Method</label>
                                        <select
                                            className="w-full p-3 rounded-xl border bg-background text-sm outline-none"
                                            value={newCoupon.allowed_payment_method}
                                            onChange={e => setNewCoupon({ ...newCoupon, allowed_payment_method: e.target.value })}
                                        >
                                            <option value="ALL">All Methods</option>
                                            <option value="PREPAID">Prepaid Only</option>
                                            <option value="COD">COD Only</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/10"
                                >
                                    Create Coupon
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Coupon Cards */}
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className={`group relative bg-card border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 ${!coupon.is_active ? 'opacity-70 grayscale' : ''}`}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl font-black tracking-wider text-primary group-hover:scale-105 transition-transform origin-left">
                                                {coupon.code}
                                            </span>
                                            {coupon.is_active ? (
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                            )}
                                        </div>
                                        <span className="text-2xl font-black">
                                            {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                                        </span>
                                        {coupon.allowed_payment_method && coupon.allowed_payment_method !== 'ALL' && (
                                            <div className="mt-1 inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                                                {coupon.allowed_payment_method} ONLY
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => toggleStatus(coupon)}
                                            className={`p-2 rounded-xl transition-colors ${coupon.is_active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                        >
                                            {coupon.is_active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="p-2 bg-muted hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 py-4 border-y border-muted/50">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Min Order
                                        </span>
                                        <span className="font-bold">₹{coupon.min_order_amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Expiry
                                        </span>
                                        <span className={`font-bold ${coupon.expires_at && new Date(coupon.expires_at) < new Date() ? 'text-red-500' : ''}`}>
                                            {coupon.expires_at ? format(new Date(coupon.expires_at), 'MMM dd, yyyy') : 'No Expiry'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Usage</span>
                                        <span className="text-sm font-black">
                                            {coupon.used_count} / {coupon.usage_limit || '∞'} uses
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Edge Effect */}
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full border border-muted -translate-y-1/2" />
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full border border-muted -translate-y-1/2" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
