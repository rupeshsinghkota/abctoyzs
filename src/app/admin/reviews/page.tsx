"use client";

import { useEffect, useState } from 'react';
import { ReviewService, Review } from '@/lib/services/reviews';
import { AdminService } from '@/lib/services/admin';
import {
    MessageSquare,
    Star,
    Trash2,
    CheckCircle,
    Download,
    Upload,
    Loader2,
    Search,
    Filter,
    MoreVertical,
    ChevronDown,
    X
} from 'lucide-react';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [showImport, setShowImport] = useState(false);
    const [importData, setImportData] = useState<string>('');
    const [importLoading, setImportLoading] = useState(false);

    useEffect(() => {
        loadReviews();
    }, []);

    async function loadReviews() {
        try {
            const data = await ReviewService.getAllReviews();
            setReviews(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            await ReviewService.deleteReview(id);
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            alert('Failed to delete review');
        }
    }

    async function handleApprove(id: string) {
        try {
            await ReviewService.approveReview(id);
            setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: true } : r));
        } catch (error) {
            alert('Failed to approve review');
        }
    }

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.product?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'pending' && !r.is_approved) ||
            (statusFilter === 'approved' && r.is_approved);
        return matchesSearch && matchesStatus;
    });

    const pendingCount = reviews.filter(r => !r.is_approved).length;

    async function handleImport() {
        if (!importData) return;
        setImportLoading(true);
        try {
            // Very basic CSV parser for now
            const lines = importData.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Get all products to map product_name or slug to product_id
            const products = await AdminService.getProducts();

            const importedReviews = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',').map(v => v.trim());
                const review: any = {
                    is_approved: true,
                    is_verified: true,
                    helpful_count: 0,
                    created_at: new Date().toISOString()
                };

                headers.forEach((header, i) => {
                    const value = values[i];
                    if (header === 'customer_name' || header === 'name') review.customer_name = value;
                    if (header === 'rating') review.rating = parseInt(value) || 5;
                    if (header === 'comment') review.comment = value;
                    if (header === 'location') review.location = value;
                    if (header === 'product' || header === 'product_name') {
                        const product = products.find(p => p.name.toLowerCase() === value.toLowerCase());
                        if (product) review.product_id = product.id;
                    }
                    if (header === 'product_id') review.product_id = value;
                });

                return review;
            }).filter(r => r.product_id && r.customer_name);

            if (importedReviews.length === 0) {
                alert('No valid reviews found. Check column headers (customer_name, rating, comment, product_name)');
                return;
            }

            await ReviewService.bulkInsertReviews(importedReviews);
            alert(`Successfully imported ${importedReviews.length} reviews`);
            setShowImport(false);
            setImportData('');
            loadReviews();
        } catch (error) {
            console.error(error);
            alert('Import failed. Please check the format.');
        } finally {
            setImportLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Reviews</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage customer feedback and testimonials
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowImport(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border rounded-2xl font-bold hover:bg-zinc-50 transition-all text-sm"
                    >
                        <Upload className="w-4 h-4" />
                        Import Reviews
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">Total Reviews</span>
                    </div>
                    <p className="text-3xl font-black">{reviews.length}</p>
                </div>
                <div className="bg-white border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-50 rounded-xl">
                            <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">Pending Approval</span>
                    </div>
                    <p className="text-3xl font-black">{pendingCount}</p>
                </div>
                <div className="bg-white border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-50 rounded-xl">
                            <Star className="w-5 h-5 text-yellow-500" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">Avg. Rating</span>
                    </div>
                    <p className="text-3xl font-black">
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0).toFixed(1)}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border rounded-2xl p-4">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-zinc-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white border rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-50 border-b">
                        <tr>
                            <th className="text-left p-4 text-xs font-black uppercase text-zinc-400">Customer</th>
                            <th className="text-left p-4 text-xs font-black uppercase text-zinc-400">Rating & Product</th>
                            <th className="text-left p-4 text-xs font-black uppercase text-zinc-400">Comment</th>
                            <th className="text-left p-4 text-xs font-black uppercase text-zinc-400">Status</th>
                            <th className="text-right p-4 text-xs font-black uppercase text-zinc-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredReviews.map((review) => (
                            <tr key={review.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold">{review.customer_name}</div>
                                    <div className="text-xs text-muted-foreground">{review.location || 'India'}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-zinc-200'}`} />
                                        ))}
                                    </div>
                                    <div className="text-xs font-bold text-primary truncate max-w-[200px]">
                                        {review.product?.name || 'Unknown Product'}
                                    </div>
                                </td>
                                <td className="p-4 max-w-xs">
                                    <p className="text-sm line-clamp-2">{review.comment}</p>
                                </td>
                                <td className="p-4">
                                    {review.is_approved ? (
                                        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg">Approved</span>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-lg">Pending</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {!review.is_approved && (
                                            <button
                                                onClick={() => handleApprove(review.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredReviews.length === 0 && (
                    <div className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                        <h3 className="font-bold text-zinc-400">No reviews found</h3>
                    </div>
                )}
            </div>

            {/* Import Modal */}
            {showImport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black">Import Reviews</h2>
                            <button onClick={() => setShowImport(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                            Paste your CSV data below. Make sure it has headers: <code className="bg-zinc-100 px-1 rounded">customer_name, rating, comment, product_name</code>
                        </p>

                        <textarea
                            className="w-full h-64 p-4 bg-zinc-50 border rounded-2xl text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="customer_name, rating, comment, product_name&#10;John Doe, 5, Amazing toy!, Ferrari Ride-on"
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                        />

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowImport(false)}
                                className="flex-1 px-6 py-3 bg-zinc-100 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importLoading}
                                className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Start Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Clock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
