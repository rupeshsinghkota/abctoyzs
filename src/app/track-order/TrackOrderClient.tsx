"use client";

import React, { useState } from "react";
import {
    Search, Package, Truck, Clock,
    AlertCircle, MapPin, Hash,
    FileText
} from "lucide-react";
import { InvoiceService } from "@/lib/services/invoice";

export default function TrackOrderClient() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trackingData, setTrackingData] = useState<any>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setTrackingData(null);

        try {
            const response = await fetch(`/api/order/track?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Order not found");
            }

            setTrackingData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
            <div className="container max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-4">
                        Track Your <span className="text-primary italic">Adventure.</span>
                    </h1>
                    <p className="text-zinc-500 text-lg">
                        Enter your Order ID or Phone Number to see real-time updates.
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 border border-zinc-100 mb-12">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Order ID or Phone Number"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-lg"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-zinc-900 text-white font-black px-10 py-5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 text-lg shadow-xl shadow-primary/20"
                        >
                            {loading ? "Searching..." : "Track Order"}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}
                </div>

                {/* Tracking Results */}
                {trackingData && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <SummaryItem
                                icon={<Hash className="w-5 h-5" />}
                                label="Order ID"
                                value={trackingData.order.id.slice(0, 8).toUpperCase()}
                            />
                            <SummaryItem
                                icon={<Package className="w-5 h-5" />}
                                label="Status"
                                value={trackingData.tracking.status || trackingData.order.status}
                                highlight
                            />
                            <SummaryItem
                                icon={<Truck className="w-5 h-5" />}
                                label="Payment"
                                value={trackingData.order.payment_status === 'paid' ? 'Paid' : 'COD (Pending)'}
                            />
                        </div>

                        {/* Customer Action: Download Invoice */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => InvoiceService.generateInvoice(trackingData.order)}
                                className="group flex items-center gap-3 bg-zinc-900 hover:bg-primary text-white px-8 py-5 rounded-3xl transition-all shadow-xl shadow-zinc-200 hover:shadow-primary/20 active:scale-95"
                            >
                                <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Official Receipt</p>
                                    <p className="font-black text-sm">Download PDF Invoice</p>
                                </div>
                            </button>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 border border-zinc-100">
                            <h3 className="text-2xl font-black text-zinc-900 mb-10">Delivery Timeline</h3>

                            <div className="space-y-0">
                                {trackingData.tracking.tracking_data?.shipment_track_activities?.map((activity: any, idx: number) => (
                                    <TimelineItem
                                        key={idx}
                                        date={activity.date}
                                        location={activity.location}
                                        activity={activity.activity}
                                        isFirst={idx === 0}
                                        isLast={idx === trackingData.tracking.tracking_data.shipment_track_activities.length - 1}
                                    />
                                )) || (
                                        <div className="py-12 text-center text-zinc-400">
                                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p className="font-bold">Syncing tracking details from Shiprocket...</p>
                                            <p className="text-sm">Please check back in 15-30 minutes.</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryItem({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                {icon}
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className={`text-xl font-black ${highlight ? 'text-primary uppercase italic' : 'text-zinc-900'}`}>{value}</p>
        </div>
    );
}

function TimelineItem({ date, location, activity, isFirst, isLast }: { date: string, location: string, activity: string, isFirst: boolean, isLast: boolean }) {
    return (
        <div className="flex gap-6">
            <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${isFirst ? 'bg-primary ring-4 ring-primary/20' : 'bg-zinc-200'} shrink-0`} />
                {!isLast && <div className="w-1 h-16 bg-zinc-100" />}
            </div>
            <div className="pb-10">
                <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">{date}</p>
                <p className="text-lg font-bold text-zinc-900 mb-1 leading-tight">{activity}</p>
                <div className="flex items-center gap-1 text-zinc-500 text-sm">
                    <MapPin className="w-3 h-3" />
                    <span className="font-medium italic">{location}</span>
                </div>
            </div>
        </div>
    );
}
