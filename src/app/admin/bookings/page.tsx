"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Loader2, Video, Calendar, Clock, User, Phone,
    Mail, ExternalLink, Search, RefreshCcw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Booking = {
    id: string;
    created_at: string;
    total_amount: number;
    payment_status: string;
    status: string;
    advance_amount: number;
    guest_email: string;
    razorpay_payment_id?: string;
    shipping_address?: {
        name: string;
        phone: string;
        email: string;
    };
    items?: {
        product_name: string;
    }[];
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const supabase = createClient();

    async function loadBookings() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, created_at, total_amount, payment_status, status, advance_amount,
                    guest_email, razorpay_payment_id,
                    shipping_address:addresses(name, phone, email),
                    items:order_items(product_name)
                `)
                .eq('payment_method', 'BOOKING')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings((data as any[]) || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBookings();
    }, []);

    const filtered = bookings.filter(b => {
        const q = search.toLowerCase();
        const name = (b.shipping_address as any)?.name?.toLowerCase() || '';
        const phone = (b.shipping_address as any)?.phone || '';
        const product = b.items?.[0]?.product_name?.toLowerCase() || '';
        return !q || name.includes(q) || phone.includes(q) || product.includes(q) || b.id.includes(q);
    });

    const isPaid = (b: Booking) => ['paid', 'paid_advance'].includes(b.payment_status);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        Video Call Bookings
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1 ml-[52px]">
                        All scheduled live showroom consultations
                    </p>
                </div>
                <button
                    onClick={loadBookings}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-sm font-bold text-zinc-700 transition-all active:scale-95"
                >
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Bookings', value: bookings.length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                    { label: 'Payment Confirmed', value: bookings.filter(isPaid).length, color: 'bg-green-50 text-green-700 border-green-100' },
                    { label: 'Pending Payment', value: bookings.filter(b => !isPaid(b)).length, color: 'bg-amber-50 text-amber-700 border-amber-100' },
                ].map((s) => (
                    <div key={s.label} className={cn("rounded-2xl border p-4", s.color)}>
                        <p className="text-3xl font-black">{s.value}</p>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search by name, phone, product..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
            </div>

            {/* Table / Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-24 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    <span className="font-bold">Loading bookings...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
                    <Video className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold text-lg">No bookings found</p>
                    <p className="text-sm mt-1">Video call slots will appear here once customers book them.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/80">
                                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer</th>
                                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Product</th>
                                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Booked On</th>
                                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Payment</th>
                                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filtered.map((b) => {
                                    const addr = b.shipping_address as any;
                                    const product = b.items?.[0]?.product_name || 'N/A';
                                    const date = new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                    const time = new Date(b.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-black text-zinc-900">{addr?.name || 'Guest'}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Phone className="w-3 h-3 text-zinc-400" />
                                                    <span className="text-[11px] text-zinc-500 font-medium">{addr?.phone || '—'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="w-3 h-3 text-zinc-400" />
                                                    <span className="text-[11px] text-zinc-500 font-medium">{addr?.email || b.guest_email || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-zinc-800 max-w-[200px] line-clamp-2 text-xs">{product}</p>
                                                <p className="text-[10px] text-zinc-400 mt-1 font-mono">#{b.id.slice(0, 8)}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-zinc-700">
                                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                                    <span className="font-bold text-xs">{date}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-medium">{time}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {isPaid(b) ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100">
                                                        <CheckCircle2 className="w-3 h-3" /> ₹99 Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
                                                        <AlertCircle className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                                {b.razorpay_payment_id && (
                                                    <p className="text-[9px] text-zinc-400 font-mono mt-1.5 truncate max-w-[120px]">{b.razorpay_payment_id}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <a
                                                    href={`https://wa.me/${(addr?.phone || '').replace(/\D/g, '').replace(/^0/, '91')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1da851] rounded-xl text-[10px] font-black uppercase tracking-wide border border-[#25D366]/20 transition-all"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" /> WhatsApp
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {filtered.map((b) => {
                            const addr = b.shipping_address as any;
                            const product = b.items?.[0]?.product_name || 'N/A';
                            const date = new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                            return (
                                <div key={b.id} className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-black text-zinc-900">{addr?.name || 'Guest'}</p>
                                            <p className="text-xs text-zinc-500 font-medium">{addr?.phone || '—'}</p>
                                        </div>
                                        {isPaid(b) ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase border border-green-100">
                                                <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase border border-amber-100">
                                                <AlertCircle className="w-2.5 h-2.5" /> Pending
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-zinc-700 line-clamp-1">{product}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-zinc-500">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-xs font-bold">{date}</span>
                                        </div>
                                        <a
                                            href={`https://wa.me/${(addr?.phone || '').replace(/\D/g, '').replace(/^0/, '91')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#1da851] rounded-lg text-[10px] font-black uppercase border border-[#25D366]/20"
                                        >
                                            <ExternalLink className="w-3 h-3" /> WhatsApp
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
