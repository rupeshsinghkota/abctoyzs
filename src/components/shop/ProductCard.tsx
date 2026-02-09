"use client";

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Zap, Gauge, Baby, Weight } from 'lucide-react';
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
    const ageLabel = product.ageGroup || product.specs?.suitable_age;
    const loadLabel = product.specs?.max_load;
    const hasSpecs = powerLabel || ageLabel || loadLabel;

    return (
        <div className={cn(
            "group relative bg-white rounded-2xl border border-zinc-100/80 transition-all duration-500 flex flex-col h-full",
            "hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:-translate-y-0.5",
            className
        )}>
            {/* Image Container with Badges */}
            <div className="relative aspect-square overflow-hidden bg-[#FAF9F6] m-2 rounded-xl flex items-center justify-center p-4 lg:p-6">
                {/* Wishlist - Minimalist Side */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <WishlistButton
                        productId={product.id}
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm shadow-sm border-none hover:bg-white text-zinc-400 hover:text-red-500 transition-all"
                    />
                </div>

                {/* Minimal Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {product.tag && product.tag.toLowerCase() === 'new' && (
                        <div className="bg-[#E9EDEB] px-2 py-0.5 rounded-full">
                            <span className="text-[10px] font-semibold text-[#5D6F66] uppercase tracking-[0.05em]">New</span>
                        </div>
                    )}
                    {discount > 5 && (
                        <div className="bg-[#F8E7E4] px-2 py-0.5 rounded-full">
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
                <div className="flex items-center gap-3 px-4 pt-1 pb-0 flex-wrap">
                    {powerLabel && (
                        <div className="flex items-center gap-1 text-zinc-400">
                            <Gauge className="w-3 h-3" />
                            <span className="text-[9px] lg:text-[10px] font-medium uppercase tracking-wide">{powerLabel}</span>
                        </div>
                    )}
                    {ageLabel && (
                        <div className="flex items-center gap-1 text-zinc-400">
                            <Baby className="w-3 h-3" />
                            <span className="text-[9px] lg:text-[10px] font-medium uppercase tracking-wide">{ageLabel}</span>
                        </div>
                    )}
                    {loadLabel && (
                        <div className="flex items-center gap-1 text-zinc-400">
                            <Weight className="w-3 h-3" />
                            <span className="text-[9px] lg:text-[10px] font-medium uppercase tracking-wide">{loadLabel}</span>
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
                                <span className="text-zinc-600">{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <Link href={`/product/${product.slug}`} className="block">
                        <h3 className="text-sm lg:text-[15px] font-medium text-zinc-800 line-clamp-2 leading-snug group-hover:text-zinc-900 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* Footer: Price & Add Icon */}
                <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base lg:text-[17px] font-bold text-zinc-900">₹{product.price.toLocaleString()}</span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-xs text-zinc-400 line-through decoration-zinc-300">₹{product.mrp.toLocaleString()}</span>
                        )}
                    </div>

                    {/* Minimalist Action Icon */}
                    {product.variants && product.variants.length > 0 ? (
                        <Link
                            href={`/product/${product.slug}`}
                            className="w-8 h-8 lg:w-9 lg:h-9 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all active:scale-95 shadow-sm"
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
                            className="w-8 h-8 lg:w-9 lg:h-9 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all active:scale-95 shadow-sm"
                            title="Add to Cart"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
