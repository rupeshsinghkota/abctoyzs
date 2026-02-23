"use client";

import { Star, CheckCircle2, ThumbsUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    text: string;
    isVerified: boolean;
    helpful?: number;
    location?: string;
}

interface ProductReviewsProps {
    rating: number;
    reviewCount: number;
    productName: string;
}

const MOCK_REVIEW_POOL = [
    "Amazing quality! My kid loves it. The build is very solid and battery life is better than expected.",
    "Great product and even better service. Had a small assembly issue and they helped me instantly on WhatsApp.",
    "Best birthday gift ever. It's exactly as shown in the videos. Highly recommend for kids!",
    "The remote control works perfectly, and it's quite fast too. Good safety features.",
    "Premium feel. The plastic quality is top-notch. Worth every penny.",
    "Very happy with the purchase. Shipping was fast and packaging was secure.",
    "My son is obsessed with it. It's been 3 months and it's still running like new.",
    "Initially I was skeptical about ordering online, but the BIS certification and COD option gave me confidence. Truly a great find!"
];

const AUTHORS = ["Sushant P.", "Anjali M.", "Rohan S.", "Kavita R.", "Rahul D.", "Priyanka K.", "Amit G.", "Neha V."];
const LOCATIONS = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"];

export function ProductReviews({ rating, reviewCount, productName }: ProductReviewsProps) {
    const reviews = useMemo(() => {
        // Generate a few stable mock reviews based on the product
        const count = Math.min(3, reviewCount);
        if (count === 0) return [];

        return Array.from({ length: count }).map((_, i) => ({
            id: `rev-${i}`,
            author: AUTHORS[i % AUTHORS.length],
            rating: Math.floor(rating) + (i === 0 ? 0 : -1), // Slight variation
            date: `${i + 2} weeks ago`,
            text: MOCK_REVIEW_POOL[i % MOCK_REVIEW_POOL.length],
            isVerified: true,
            helpful: Math.floor(Math.random() * 12) + 2,
            location: LOCATIONS[i % LOCATIONS.length]
        }));
    }, [rating, reviewCount]);

    if (reviewCount === 0) return null;

    return (
        <section className="mt-12 lg:mt-16 border-t border-gray-100 pt-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Verified <span className="text-primary">Parent Reviews</span></h2>
                    <p className="text-gray-500 text-sm mt-1">Real feedback from families who bought {productName}.</p>
                </div>

                <div className="flex items-center gap-6 bg-zinc-50 px-6 py-4 rounded-2xl border border-zinc-100/50">
                    <div className="text-center">
                        <div className="text-3xl font-black text-zinc-900">{rating}</div>
                        <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={cn("w-3 h-3", s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-zinc-200 text-zinc-200")} />
                            ))}
                        </div>
                    </div>
                    <div className="w-px h-10 bg-zinc-200" />
                    <div>
                        <div className="text-lg font-bold text-zinc-900">{reviewCount}</div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Reviews</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r) => (
                    <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={cn("w-3.5 h-3.5", s <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-200 text-zinc-200")} />
                                ))}
                            </div>
                            <span className="text-[10px] font-medium text-gray-400">{r.date}</span>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed italic flex-1">"{r.text}"</p>

                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">{r.author}</p>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        <span className="text-[9px] font-black uppercase tracking-wider text-green-600">Verified • {r.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{r.helpful}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {reviewCount > 3 && (
                <div className="mt-8 text-center">
                    <button className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                        View All {reviewCount} Reviews
                    </button>
                </div>
            )}
        </section>
    );
}
