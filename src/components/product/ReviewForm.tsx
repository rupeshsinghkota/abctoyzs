"use client";

import { useState } from 'react';
import { Star, X, CheckCircle2, User, MapPin, Send, Loader2 } from 'lucide-react';
import { ReviewService } from '@/lib/services/reviews';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
    productId: string;
    productName: string;
    onSuccess?: () => void;
    onClose?: () => void;
}

export function ReviewForm({ productId, productName, onSuccess, onClose }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !comment) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            await ReviewService.submitReview({
                product_id: productId,
                customer_name: name,
                rating,
                comment,
                location: location || undefined
            });
            toast.success("Review submitted! It will be visible after verification.");
            onSuccess?.();
            onClose?.();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Share Your <span className="text-primary">Experience</span></h2>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Reviewing {productName}</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Selection */}
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Overall Satisfaction</span>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onMouseEnter={() => setHover(s)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(s)}
                                className="group transition-all"
                            >
                                <Star
                                    className={cn(
                                        "w-10 h-10 transition-all duration-300",
                                        (hover || rating) >= s
                                            ? "fill-yellow-400 text-yellow-400 scale-110"
                                            : "fill-gray-100 text-gray-200 hover:scale-105"
                                    )}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
                            <User className="w-3 h-3" /> Your Name *
                        </label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Sushant P."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Location
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Mumbai"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Comment */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Your Detailed Feedback *</label>
                    <textarea
                        required
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you and your little one love about this toy?"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium resize-none"
                    />
                </div>

                {/* Info Note */}
                <div className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-[11px] text-blue-600 leading-relaxed">
                        To maintain high trust, all reviews undergo a quick moderation check. Verified badges are awarded based on order history.
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    disabled={submitting}
                    type="submit"
                    className="w-full bg-zinc-900 text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Submit Review
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
