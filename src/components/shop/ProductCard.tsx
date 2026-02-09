"use client";

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Zap, Gauge, Baby, Weight, Flame } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Product } from '@/lib/data';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    const addToCart = useStore((state) => state.addToCart);

    const calculateDiscount = (price: number, mrp?: number) => {
        if (!mrp || mrp <= price) return 0;
        return Math.round(((mrp - price) / mrp) * 100);
    };

    const calculateSavings = (price: number, mrp?: number) => {
        if (!mrp || mrp <= price) return 0;
        return Math.round(mrp - price);
    };

    const discount = calculateDiscount(product.price, product.mrp);
    const savings = calculateSavings(product.price, product.mrp);
    const hasReviews = product.reviews > 0;

    // Derive specs
    const powerLabel = product.voltage || product.specs?.battery;
    const ageRaw = product.ageGroup || product.specs?.suitable_age;
    const ageLabel = ageRaw ? (ageRaw.toLowerCase().includes('yr') || ageRaw.toLowerCase().includes('year') ? ageRaw : `${ageRaw} Yrs`) : null;
    const loadRaw = product.specs?.max_load;
    const loadLabel = loadRaw ? (loadRaw.toLowerCase().includes('kg') ? loadRaw : `${loadRaw} kg`) : null;
    const hasSpecs = powerLabel || ageLabel || loadLabel;

    // Tag logic
    const tag = product.tag;
    const isNew = tag?.toLowerCase() === 'new';
    const isBestSeller = tag?.toLowerCase() === 'best seller';

    return (
        <div className={cn(
            "group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-out flex flex-col h-full",
            "border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
            "hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-zinc-200",
            className
        )}>
            {/* Image Container */}
            <div className="relative aspect-[4/3.5] overflow-hidden bg-gradient-to-br from-slate-50 to-zinc-100 flex items-center justify-center p-3 lg:p-5">
                {/* Wishlist — always on mobile, hover on desktop */}
                <div className="absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 md:translate-y-1 md:group-hover:translate-y-0">
                    <WishlistButton
                        productId={product.id}
                        size="sm"
                        className="bg-white/95 backdrop-blur-sm shadow-md border-none hover:bg-white text-zinc-400 hover:text-rose-500 hover:scale-110 transition-all duration-200"
                    />
                </div>

                {/* Badges — slide in from left */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
                    {isNew && (
                        <div className="bg-emerald-500 px-2 py-[3px] rounded-md animate-[fadeIn_0.3s_ease-out]">
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">New</span>
                        </div>
                    )}
                    {isBestSeller && (
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-[3px] rounded-md flex items-center gap-0.5 animate-[fadeIn_0.3s_ease-out]">
                            <Flame className="w-2.5 h-2.5 text-white" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Bestseller</span>
                        </div>
                    )}
                    {!isNew && !isBestSeller && tag && (
                        <div className="bg-zinc-800 px-2 py-[3px] rounded-md">
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">{tag}</span>
                        </div>
                    )}
                    {discount > 5 && (
                        <div className="bg-rose-500 px-2 py-[3px] rounded-md">
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">{discount}% OFF</span>
                        </div>
                    )}
                </div>

                {/* Product Image — subtle float on hover */}
                <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:-translate-y-1"
                    />
                </Link>
            </div>

            {/* Content — compact */}
            <div className="px-3 pb-3 pt-2.5 flex flex-col flex-1 gap-2">
                {/* Specs Strip */}
                {hasSpecs && (
                    <div className="flex items-center gap-2 flex-wrap -mt-0.5">
                        {powerLabel && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded">
                                <Gauge className="w-2.5 h-2.5" />
                                {powerLabel}
                            </span>
                        )}
                        {ageLabel && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded">
                                <Baby className="w-2.5 h-2.5" />
                                {ageLabel}
                            </span>
                        )}
                        {loadLabel && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded">
                                <Weight className="w-2.5 h-2.5" />
                                {loadLabel}
                            </span>
                        )}
                    </div>
                )}

                {/* Title & Category */}
                <div className="flex-1 space-y-0.5 min-h-0">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">{product.category}</span>
                        {hasReviews && (
                            <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-[1px] rounded">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] text-amber-700 font-bold">{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                    <Link href={`/product/${product.slug}`} className="block">
                        <h3 className="text-[13px] lg:text-sm font-semibold text-zinc-800 line-clamp-2 leading-[1.3] group-hover:text-primary transition-colors duration-200">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* Price & Action — compact row */}
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-zinc-100">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[15px] lg:text-base font-extrabold text-zinc-900">₹{product.price.toLocaleString()}</span>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-[10px] text-zinc-400 line-through">₹{product.mrp.toLocaleString()}</span>
                            )}
                        </div>
                        {savings > 500 && (
                            <p className="text-[9px] lg:text-[10px] font-bold text-emerald-600">
                                Save ₹{savings.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Action Button — with hover animation */}
                    {product.variants && product.variants.length > 0 ? (
                        <Link
                            href={`/product/${product.slug}`}
                            className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white hover:bg-primary hover:scale-105 transition-all duration-200 active:scale-95 shadow-sm"
                            title="View Options"
                        >
                            <Zap className="w-3.5 h-3.5" />
                        </Link>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    quantity: 1,
                                    attributes: {}
                                });
                            }}
                            className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white hover:bg-primary hover:scale-105 transition-all duration-200 active:scale-95 shadow-sm"
                            title="Add to Cart"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

