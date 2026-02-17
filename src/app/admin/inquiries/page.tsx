"use client";

import { useEffect, useState } from "react";
import { AdminService } from "@/lib/services/admin";
import {
    Mail,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
    Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadInquiries();
    }, []);

    async function loadInquiries() {
        try {
            const data = await AdminService.getInquiries();
            setInquiries(data);
        } catch (error) {
            console.error("Failed to load inquiries:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(id: string, status: string) {
        try {
            await AdminService.updateInquiryStatus(id, status);
            setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status } : inq));
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    }

    const filteredInquiries = inquiries
        .filter(inq => filter === "all" || inq.status === filter)
        .filter(inq =>
            inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.message.toLowerCase().includes(searchTerm.toLowerCase())
        );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Contact Inquiries</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage and respond to customer messages from the Contact Us form.
                    </p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or content..."
                        className="w-full pl-10 pr-4 py-2 bg-card border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-card border p-1 rounded-xl">
                    {["all", "pending", "contacted", "resolved"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inquiries List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => (
                        <div
                            key={inquiry.id}
                            className="bg-card border rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between lg:justify-start lg:gap-4">
                                        <div className={`p-3 rounded-2xl ${inquiry.status === 'resolved' ? 'bg-green-50 text-green-600' :
                                                inquiry.status === 'contacted' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-amber-50 text-amber-600'
                                            }`}>
                                            {inquiry.status === 'resolved' ? <CheckCircle2 className="w-6 h-6" /> :
                                                inquiry.status === 'contacted' ? <MessageSquare className="w-6 h-6" /> :
                                                    <Clock className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{inquiry.subject}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1.5 font-bold text-foreground">
                                                    <Mail className="w-3 h-3" /> {inquiry.name}
                                                </span>
                                                <span>{inquiry.email}</span>
                                                <span>{format(new Date(inquiry.created_at), "MMM d, yyyy • h:mm a")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed text-foreground/80 border border-muted">
                                        {inquiry.message}
                                    </div>
                                </div>

                                <div className="flex lg:flex-col items-center lg:items-stretch gap-2 shrink-0">
                                    <select
                                        value={inquiry.status}
                                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                                        className="bg-card border rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="pending">Mark Pending</option>
                                        <option value="contacted">Mark Contacted</option>
                                        <option value="resolved">Mark Resolved</option>
                                    </select>
                                    <a
                                        href={`mailto:${inquiry.email}`}
                                        className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all text-center"
                                    >
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-card border border-dashed rounded-3xl p-20 text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No inquiries found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {searchTerm || filter !== 'all'
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "When customers fill out the Contact Us form, their messages will appear here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
