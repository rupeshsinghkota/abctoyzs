"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Mail,
    Search,
    Download,
    Loader2,
    Calendar,
    User,
    Filter,
    ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subscriber {
    id: string;
    email: string;
    status: 'active' | 'unsubscribed';
    created_at: string;
}

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    async function fetchSubscribers() {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('newsletter_subscriptions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubscribers(data || []);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredSubscribers = subscribers.filter(s => {
        const matchesSearch = s.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const exportToCSV = () => {
        setExporting(true);
        try {
            const headers = ['Email', 'Status', 'Signed Up At'];
            const rows = filteredSubscribers.map(s => [
                s.email,
                s.status,
                new Date(s.created_at).toLocaleString()
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `abctoyz_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Mail className="w-8 h-8 text-primary" />
                        Newsletter Subscribers
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and export your newsletter audience.
                    </p>
                </div>
                <button
                    onClick={exportToCSV}
                    disabled={exporting || filteredSubscribers.length === 0}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                    {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-card border rounded-3xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted/50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-2xl border w-full md:w-fit">
                    {(['all', 'active', 'unsubscribed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                                statusFilter === f ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-card border rounded-3xl overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground font-medium">Loading subscribers...</p>
                    </div>
                ) : filteredSubscribers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Subscriber</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell hidden">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Joined Date</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredSubscribers.map((subscriber) => (
                                    <tr key={subscriber.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground truncate max-w-[200px] md:max-w-md">{subscriber.email}</p>
                                                    <span className={cn(
                                                        "inline-block md:hidden text-[10px] font-black uppercase tracking-widest mt-1",
                                                        subscriber.status === 'active' ? "text-green-500" : "text-red-500"
                                                    )}>
                                                        {subscriber.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 md:table-cell hidden">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                subscriber.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {subscriber.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(subscriber.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Action placeholder */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">No subscribers found</h3>
                        <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                            {searchTerm ? `No results for "${searchTerm}"` : "You don't have any newsletter subscribers yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
