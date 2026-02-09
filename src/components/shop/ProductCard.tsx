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
    const specs = [
        powerLabel && { icon: Gauge, label: powerLabel },
        ageLabel && { icon: Baby, label: ageLabel },
        loadLabel && { icon: Weight, label: loadLabel },
    ].filter(Boolean) as { icon: React.ElementType; label: string }[];

    // Tag logic
    const tag = product.tag;
    const isNew = tag?.toLowerCase() === 'new';
    const isBestSeller = tag?.toLowerCase() === 'best seller';

    return (
        <div className={cn(
            "group relative bg-white rounded-xl overflow-hidden transition-all duration-300 ease-out flex flex-col h-full",
            "border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
            "hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-zinc-200",
            className
        )}>
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 flex items-center justify-center">
                {/* Subtle gradient for badge readability */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent z-[5] pointer-events-none" />

                {/* Wishlist */}
                <div className="absolute top-1.5 right-1.5 z-10 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 md:translate-y-1 md:group-hover:translate-y-0">
                    <WishlistButton
                        productId={product.id}
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm shadow-md border-none hover:bg-white text-zinc-400 hover:text-rose-500 hover:scale-110 transition-all duration-200 !w-7 !h-7"
                    />
                </div>

                {/* Badges — compact, inline */}
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none flex-wrap">
                    {isNew && (
                        <span className="bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded">
                            New
                        </span>
                    )}
                    {isBestSeller && (
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded inline-flex items-center gap-0.5">
                            <Flame className="w-2 h-2" />
                            Hot
                        </span>
                    )}
                    {!isNew && !isBestSeller && tag && (
                        <span className="bg-zinc-800/80 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded">
                            {tag}
                        </span>
                    )}
                    {discount > 5 && (
                        <span className="bg-rose-500 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded">
                            {discount}% OFF
                        </span>
                    )}
                </div>

                {/* Product Image */}
                <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center p-2 lg:p-4">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                </Link>
            </div>

            {/* Content */}
            <div className="px-2.5 pb-2.5 pt-2 flex flex-col flex-1 gap-1.5">
                {/* Specs — single row, no wrapping */}
                {specs.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        {specs.map((spec, i) => (
                            <span key={i} className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-[1px] rounded whitespace-nowrap flex-shrink-0">
                                <spec.icon className="w-2.5 h-2.5 flex-shrink-0" />
                                {spec.label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Category & Rating */}
                <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] text-slate-400 font-semibold uppercase tracking-widest">{product.category}</span>
                    {hasReviews && (
                        <div className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span className="text-[9px] text-amber-700 font-bold">{product.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <Link href={`/product/${product.slug}`} className="block flex-1">
                    <h3 className="text-[12px] md:text-[13px] font-semibold text-zinc-800 line-clamp-2 leading-[1.35] group-hover:text-primary transition-colors duration-200">
                        {product.name}
                    </h3>
                </Link>

                {/* Price & Action */}
                <div className="flex items-end justify-between gap-1 pt-1.5 mt-auto border-t border-zinc-50">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[14px] md:text-[15px] font-extrabold text-zinc-900">₹{product.price.toLocaleString()}</span>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-[9px] text-zinc-400 line-through">₹{product.mrp.toLocaleString()}</span>
                            )}
                        </div>
                        {savings > 500 && (
                            <p className="text-[8px] md:text-[9px] font-bold text-emerald-600">
                                Save ₹{savings.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Action Button */}
                    {product.variants && product.variants.length > 0 ? (
                        <Link
                            href={`/product/${product.slug}`}
                            className="w-7 h-7 md:w-8 md:h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white hover:bg-primary hover:scale-105 transition-all duration-200 active:scale-95 flex-shrink-0"
                            title="View Options"
                        >
                            <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" />
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
                            className="w-7 h-7 md:w-8 md:h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white hover:bg-primary hover:scale-105 transition-all duration-200 active:scale-95 flex-shrink-0"
                            title="Add to Cart"
                        >
                            <ShoppingCart className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

