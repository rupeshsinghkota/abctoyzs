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
    admin_notes?: string;
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
                    guest_email, razorpay_payment_id, admin_notes,
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

    async function updateBookingStatus(id: string, newStatus: string) {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        } catch (e) {
            console.error('Status update failed:', e);
            alert('Failed to update status');
        }
    }

    useEffect(() => {
        loadBookings();
    }, []);

    const parseBookingDetails = (notes?: string) => {
        if (!notes || !notes.startsWith('JSON_BOOKING:')) return null;
        try {
            return JSON.parse(notes.replace('JSON_BOOKING:', ''));
        } catch {
            return null;
        }
    };

    const filtered = bookings.filter(b => {
        const q = search.toLowerCase();
        const details = parseBookingDetails(b.admin_notes);
        const name = (b.shipping_address as any)?.name?.toLowerCase() || '';
        const phone = (b.shipping_address as any)?.phone || '';
        const product = b.items?.[0]?.product_name?.toLowerCase() || '';
        return !q || name.includes(q) || phone.includes(q) || product.includes(q) || b.id.includes(q);
    });

    const isPaid = (b: Booking) => ['paid', 'paid_advance'].includes(b.payment_status);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'delivered': return { label: 'Purchased', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
            case 'shipped': return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'processing': return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 border-blue-200' };
            default: return { label: status, color: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg shadow-zinc-200">
                            <Video className="w-5 h-5 text-primary" />
                        </div>
                        Video Call Dashboard
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1 ml-0 md:ml-[52px]">
                        Track scheduled showroom tours and follow-up status
                    </p>
                </div>
                <button
                    onClick={loadBookings}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-700 transition-all active:scale-95 shadow-sm"
                >
                    <RefreshCcw className="w-3.5 h-3.5" /> Sync Data
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Requests', value: bookings.length, color: 'bg-zinc-50 text-zinc-700 border-zinc-100' },
                    { label: 'Upcoming', value: bookings.filter(b => b.status === 'processing').length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                    { label: 'Completed', value: bookings.filter(b => b.status === 'shipped').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                    { label: 'Converted', value: bookings.filter(b => b.status === 'delivered').length, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                ].map((s) => (
                    <div key={s.label} className={cn("rounded-2xl border p-5 shadow-sm", s.color)}>
                        <p className="text-3xl font-black tracking-tight">{s.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70 leading-none">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search customer, phone or product..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-sm"
                />
            </div>

            {/* Table / Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-100">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <span className="font-bold text-sm uppercase tracking-widest">Warming Up Engines...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-100">
                    <Video className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold text-lg text-zinc-900">No active bookings</p>
                    <p className="text-sm mt-1">Video call slots will appear here once customers book them.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/40">
                                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer & Product</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Scheduled Slot</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Meeting Link</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Follow-up Status</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filtered.map((b) => {
                                    const addr = b.shipping_address as any;
                                    const product = b.items?.[0]?.product_name || 'N/A';
                                    const details = parseBookingDetails(b.admin_notes);

                                    const statusInfo = getStatusInfo(b.status);

                                    return (
                                        <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-xs text-zinc-600">
                                                        {(addr?.name || 'G')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-zinc-900">{addr?.name || 'Guest'}</p>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide truncate max-w-[150px]">{product}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {details ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-zinc-900">
                                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                                            <span className="font-black text-xs">{details.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-zinc-500">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="text-[11px] font-bold">{details.time}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-zinc-400 italic text-[11px]">No slot details</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                {details?.meet && details.meet.startsWith('http') ? (
                                                    <a
                                                        href={details.meet}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                                                    >
                                                        <Video className="w-3.5 h-3.5" /> Join Meet
                                                    </a>
                                                ) : (
                                                    <span className="text-zinc-400 text-[10px] font-medium italic">Pending Link</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border", statusInfo.color)}>
                                                        {statusInfo.label}
                                                    </span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => updateBookingStatus(b.id, 'processing')}
                                                            className="text-[8px] font-black uppercase text-blue-500 hover:underline"
                                                        >Schedule</button>
                                                        <span className="text-zinc-300">|</span>
                                                        <button
                                                            onClick={() => updateBookingStatus(b.id, 'shipped')}
                                                            className="text-[8px] font-black uppercase text-emerald-500 hover:underline"
                                                        >Done</button>
                                                        <span className="text-zinc-300">|</span>
                                                        <button
                                                            onClick={() => updateBookingStatus(b.id, 'delivered')}
                                                            className="text-[8px] font-black uppercase text-indigo-500 hover:underline"
                                                        >Sale</button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <a
                                                    href={`https://wa.me/${(addr?.phone || '').replace(/\D/g, '').replace(/^0/, '91')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1da851] rounded-xl text-[10px] font-black uppercase tracking-wide border border-[#25D366]/20 transition-all"
                                                >
                                                    <Phone className="w-3.5 h-3.5" /> WhatsApp
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
                            const details = parseBookingDetails(b.admin_notes);
                            const statusInfo = getStatusInfo(b.status);

                            return (
                                <div key={b.id} className="bg-white rounded-[2rem] border border-zinc-100 p-5 shadow-lg space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-900">
                                                {(addr?.name || 'G')[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-zinc-900">{addr?.name || 'Guest'}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase">{product}</p>
                                            </div>
                                        </div>
                                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border", statusInfo.color)}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        {details ? (
                                            <div className="flex items-center gap-4 text-xs font-bold text-zinc-700">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                                    {details.date}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                    {details.time}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-zinc-400 italic">No slot details found</span>
                                        )}
                                        {details?.meet?.startsWith('http') && (
                                            <a href={details.meet} className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-100">
                                                <Video className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateBookingStatus(b.id, 'processing')}
                                            className="flex-1 py-2 text-[8px] font-black uppercase border rounded-lg hover:bg-zinc-50"
                                        >Scheduled</button>
                                        <button
                                            onClick={() => updateBookingStatus(b.id, 'shipped')}
                                            className="flex-1 py-2 text-[8px] font-black uppercase border rounded-lg hover:bg-zinc-50"
                                        >Done</button>
                                        <button
                                            onClick={() => updateBookingStatus(b.id, 'delivered')}
                                            className="flex-1 py-2 text-[8px] font-black uppercase border rounded-lg hover:bg-zinc-50"
                                        >Sale</button>
                                    </div>

                                    <a
                                        href={`https://wa.me/${(addr?.phone || '').replace(/\D/g, '').replace(/^0/, '91')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20"
                                    >
                                        <Phone className="w-4 h-4" /> Message on WhatsApp
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}


