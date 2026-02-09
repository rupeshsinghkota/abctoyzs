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

    // Derive specs for the card
    const powerLabel = product.voltage || product.specs?.battery;
    const ageRaw = product.ageGroup || product.specs?.suitable_age;
    const ageLabel = ageRaw ? (ageRaw.toLowerCase().includes('yr') || ageRaw.toLowerCase().includes('year') ? ageRaw : `${ageRaw} Yrs`) : null;
    const loadRaw = product.specs?.max_load;
    const loadLabel = loadRaw ? (loadRaw.toLowerCase().includes('kg') ? loadRaw : `${loadRaw} kg`) : null;
    const hasSpecs = powerLabel || ageLabel || loadLabel;

    // Tag logic — support New, Best Seller, and other tags
    const tag = product.tag;
    const isNew = tag?.toLowerCase() === 'new';
    const isBestSeller = tag?.toLowerCase() === 'best seller';

    return (
        <div className={cn(
            "group relative bg-white rounded-2xl border border-zinc-100/80 transition-all duration-500 flex flex-col h-full",
            "hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-0.5",
            className
        )}>
            {/* Image Container with Badges */}
            <div className="relative aspect-square overflow-hidden bg-[#FAF9F6] m-2 rounded-xl flex items-center justify-center p-4 lg:p-6">
                {/* Wishlist — always visible on mobile, hover on desktop */}
                <div className="absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <WishlistButton
                        productId={product.id}
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm shadow-sm border-none hover:bg-white text-zinc-400 hover:text-red-500 transition-all"
                    />
                </div>

                {/* Minimal Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {isNew && (
                        <div className="bg-[#E9EDEB] px-2.5 py-0.5 rounded-full">
                            <span className="text-[10px] font-semibold text-[#5D6F66] uppercase tracking-[0.05em]">New</span>
                        </div>
                    )}
                    {isBestSeller && (
                        <div className="bg-[#FEF3E2] px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 text-orange-500" />
                            <span className="text-[10px] font-semibold text-orange-700 uppercase tracking-[0.05em]">Bestseller</span>
                        </div>
                    )}
                    {!isNew && !isBestSeller && tag && (
                        <div className="bg-zinc-100 px-2.5 py-0.5 rounded-full">
                            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.05em]">{tag}</span>
                        </div>
                    )}
                    {discount > 5 && (
                        <div className="bg-[#F8E7E4] px-2.5 py-0.5 rounded-full">
                            <span className="text-[10px] font-semibold text-[#A6645A] uppercase tracking-[0.05em]">-{discount}%</span>
                        </div>
                    )}
                </div>

                <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                </Link>
            </div>

            {/* Technical Specs Strip */}
            {hasSpecs && (
                <div className="flex items-center gap-2.5 px-4 pt-2 pb-0 flex-wrap">
                    {powerLabel && (
                        <div className="flex items-center gap-1 text-zinc-400">
                            <Gauge className="w-3 h-3 flex-shrink-0" />
                            <span className="text-[10px] font-medium tracking-wide">{powerLabel}</span>
                        </div>
                    )}
                    {ageLabel && (
                        <div className="flex items-center gap-1 text-zinc-400">
                            <Baby className="w-3 h-3 flex-shrink-0" />
                            <span className="text-[10px] font-medium tracking-wide">{ageLabel}</span>
                        </div>
                    )}
                    {loadLabel && (
                        <div className="flex items-center gap-1 text-zinc-400">
                            <Weight className="w-3 h-3 flex-shrink-0" />
                            <span className="text-[10px] font-medium tracking-wide">{loadLabel}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Content Section */}
            <div className="px-4 pb-4 pt-2 flex flex-col flex-1">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                        <span>{product.category}</span>
                        {hasReviews && (
                            <div className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span className="text-zinc-600 font-semibold">{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <Link href={`/product/${product.slug}`} className="block">
                        <h3 className="text-sm lg:text-[15px] font-semibold text-zinc-800 line-clamp-2 leading-snug group-hover:text-zinc-900 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* Price, Savings & Action */}
                <div className="mt-3 space-y-2">
                    <div className="flex items-end justify-between gap-2">
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-base lg:text-lg font-bold text-zinc-900">₹{product.price.toLocaleString()}</span>
                                {product.mrp && product.mrp > product.price && (
                                    <span className="text-[11px] text-zinc-400 line-through decoration-zinc-300">₹{product.mrp.toLocaleString()}</span>
                                )}
                            </div>
                            {savings > 500 && (
                                <p className="text-[10px] lg:text-[11px] font-semibold text-emerald-600 mt-0.5">
                                    Save ₹{savings.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Action Icon */}
                        {product.variants && product.variants.length > 0 ? (
                            <Link
                                href={`/product/${product.slug}`}
                                className="w-9 h-9 lg:w-10 lg:h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors active:scale-95 shadow-sm flex-shrink-0"
                                title="View Options"
                            >
                                <Zap className="w-4 h-4" />
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
                                className="w-9 h-9 lg:w-10 lg:h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors active:scale-95 shadow-sm flex-shrink-0"
                                title="Add to Cart"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

