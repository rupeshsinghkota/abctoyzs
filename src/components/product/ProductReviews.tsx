"use client";

import { Star, CheckCircle2, ThumbsUp, User, PenSquare, X, Filter, Image as ImageIcon, ArrowBigUpDash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { ReviewService, Review } from '@/lib/services/reviews';
import { ReviewForm } from '@/components/product/ReviewForm';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductReviewsProps {
    productId: string;
    rating: number;
    reviewCount: number;
    productName: string;
}

export function ProductReviews({ productId, rating, reviewCount, productName }: ProductReviewsProps) {
    const [realReviews, setRealReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<'all' | 'images' | 'top'>('all');

    useEffect(() => {
        setMounted(true);
        const fetchReviews = async () => {
            try {
                const data = await ReviewService.getProductReviews(productId);
                setRealReviews(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [productId]);

    const stats = useMemo(() => {
        const counts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1
        realReviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                counts[5 - r.rating]++;
            }
        });
        return counts;
    }, [realReviews]);

    const filteredReviews = useMemo(() => {
        let list = realReviews;
        if (filter === 'images') list = list.filter(r => r.images && r.images.length > 0);
        if (filter === 'top') list = list.filter(r => r.rating >= 4);
        return list;
    }, [realReviews, filter]);

    return (
        <section className="mt-12 lg:mt-24 border-t border-zinc-100 pt-16 pb-20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest"
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Community
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-none"
                        >
                            Real stories from <br />
                            <span className="text-primary italic">our home to yours.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-zinc-500 text-lg max-w-xl"
                        >
                            Join thousands of happy parents who chose {productName} for their little champions.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                    >
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="group relative px-8 py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs overflow-hidden shadow-2xl shadow-zinc-300 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <PenSquare className="w-5 h-5 text-primary" />
                            Write a Review
                        </button>
                    </motion.div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Rating Overview */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="text-7xl font-black text-zinc-900 tracking-tighter">{rating}</div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={cn("w-6 h-6", s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-zinc-100 text-zinc-100")} />
                            ))}
                        </div>
                        <div className="text-xs font-black uppercase tracking-widest text-zinc-400">
                            Based on {reviewCount || realReviews.length} verified reviews
                        </div>
                    </motion.div>

                    {/* Star Distribution Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-4 bg-zinc-50/50 p-8 rounded-[32px] border border-zinc-100 space-y-3"
                    >
                        {stats.map((count, i) => {
                            const star = 5 - i;
                            const percentage = realReviews.length > 0 ? (count / realReviews.length * 100) : 0;
                            return (
                                <div key={star} className="flex items-center gap-4">
                                    <div className="w-8 text-xs font-black text-zinc-400 text-right">{star} <Star className="w-2.5 h-2.5 inline align-middle mb-0.5 fill-current" /></div>
                                    <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-zinc-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${percentage}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                    <div className="w-10 text-[10px] font-black text-zinc-500">{count}</div>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* Trust Signals */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4 bg-primary p-8 rounded-[32px] text-white flex flex-col justify-between"
                    >
                        <div className="p-3 bg-white/20 rounded-2xl w-fit">
                            <ThumbsUp className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black tracking-tight leading-tight">98% of parents recommend this.</h4>
                            <p className="text-white/80 text-sm font-medium">Verified by third-party audit across 15,000+ orders.</p>
                        </div>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all",
                            filter === 'all' ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300"
                        )}
                    >
                        All Reviews
                    </button>
                    <button
                        onClick={() => setFilter('images')}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                            filter === 'images' ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300"
                        )}
                    >
                        <ImageIcon className="w-4 h-4" />
                        With Photos
                    </button>
                    <button
                        onClick={() => setFilter('top')}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                            filter === 'top' ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300"
                        )}
                    >
                        <ArrowBigUpDash className="w-4 h-4" />
                        Top Rated
                    </button>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredReviews.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 text-center space-y-6 bg-zinc-50/50 rounded-[32px] border-2 border-dashed border-zinc-100"
                            >
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-zinc-100">
                                    {filter === 'all' ? (
                                        <ArrowBigUpDash className="w-10 h-10 text-primary animate-bounce" />
                                    ) : (
                                        <Filter className="w-10 h-10 text-zinc-300" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-zinc-900">
                                        {filter === 'all' ? "Be the first to share your experience!" : "No matches found."}
                                    </h3>
                                    <p className="text-zinc-400 text-sm font-medium max-w-xs mx-auto">
                                        {filter === 'all'
                                            ? `We haven't received any reviews for ${productName} yet. Share your thoughts! `
                                            : "Try adjusting your filters to see more reviews."
                                        }
                                    </p>
                                </div>
                                {filter === 'all' && (
                                    <button
                                        onClick={() => setIsFormOpen(true)}
                                        className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            filteredReviews.map((r, idx) => (
                                <motion.div
                                    key={r.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={cn("w-4 h-4", s <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-100 text-zinc-100")} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                            {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <p className="text-zinc-700 text-sm leading-relaxed italic mb-6">"{r.comment}"</p>

                                    {/* Review Images */}
                                    {r.images && r.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {r.images.map((img, i) => (
                                                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                                                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Review" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-400 text-xs shadow-inner">
                                                {r.customer_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-zinc-900">{r.customer_name}</p>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-primary" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{r.location || 'Verified Buyer'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-300 hover:text-primary">
                                            <ThumbsUp className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Review Form Modal */}
            {mounted && isFormOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md"
                        onClick={() => setIsFormOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-lg"
                    >
                        <ReviewForm
                            productId={productId}
                            productName={productName}
                            onClose={() => setIsFormOpen(false)}
                            onSuccess={() => {
                                setIsFormOpen(false);
                            }}
                        />
                    </motion.div>
                </div>,
                document.body
            )}
        </section>
    );
}
