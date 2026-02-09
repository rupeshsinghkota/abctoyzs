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

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;
    const savings = product.mrp && product.mrp > product.price
        ? Math.round(product.mrp - product.price)
        : 0;
    const hasReviews = product.reviews > 0;

    // Specs
    const powerLabel = product.voltage || product.specs?.battery;
    const ageRaw = product.ageGroup || product.specs?.suitable_age;
    const ageLabel = ageRaw
        ? (ageRaw.toLowerCase().includes('yr') || ageRaw.toLowerCase().includes('year') ? ageRaw : `${ageRaw} Yrs`)
        : null;
    const loadLabel = product.specs?.max_load;
    const specs = [
        powerLabel && { icon: Gauge, text: powerLabel },
        ageLabel && { icon: Baby, text: ageLabel },
        loadLabel && { icon: Weight, text: loadLabel },
    ].filter(Boolean) as { icon: React.ElementType; text: string }[];

    // Tags
    const tag = product.tag;
    const isNew = tag?.toLowerCase() === 'new';
    const isBestSeller = tag?.toLowerCase() === 'best seller';

    return (
        <div className={cn(
            "group relative bg-white rounded-2xl overflow-hidden flex flex-col h-full",
            "shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-zinc-100",
            "hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300",
            className
        )}>
            {/* ──── Image Area ──── */}
            <div className="relative aspect-square overflow-hidden bg-[#f5f5f4]">
                {/* Wishlist — top right */}
                <div className="absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
                    <WishlistButton
                        productId={product.id}
                        size="sm"
                        className="bg-white shadow-sm border-none hover:bg-white text-zinc-400 hover:text-rose-500 transition-all"
                    />
                </div>

                {/* Tag Badge — top left, single */}
                {(isNew || isBestSeller || (tag && !isNew && !isBestSeller)) && (
                    <div className="absolute top-2 left-2 z-10">
                        {isNew && (
                            <span className="inline-block bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
                                New
                            </span>
                        )}
                        {isBestSeller && (
                            <span className="inline-flex items-center gap-0.5 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
                                <Flame className="w-2.5 h-2.5" /> Hot
                            </span>
                        )}
                        {!isNew && !isBestSeller && tag && (
                            <span className="inline-block bg-zinc-700 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
                                {tag}
                            </span>
                        )}
                    </div>
                )}

                {/* Discount — bottom left of image */}
                {discount > 5 && (
                    <div className="absolute bottom-2 left-2 z-10">
                        <span className="inline-block bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {discount}% OFF
                        </span>
                    </div>
                )}

                {/* Specs — frosted bar at bottom of image */}
                {specs.length > 0 && (
                    <div className="absolute bottom-0 inset-x-0 z-10 bg-white/80 backdrop-blur-sm border-t border-zinc-200/50 px-2.5 py-1.5 flex items-center justify-center gap-3">
                        {specs.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600 whitespace-nowrap">
                                <s.icon className="w-3 h-3 text-zinc-400" />
                                {s.text}
                            </span>
                        ))}
                    </div>
                )}

                {/* Product Image */}
                <Link href={`/product/${product.slug}`} className="block w-full h-full p-1.5 md:p-2">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                </Link>
            </div>

            {/* ──── Content ──── */}
            <div className="p-3 flex flex-col flex-1 gap-1">
                {/* Category + Rating */}
                <div className="flex items-center justify-between">
                    <Link href={`/category/${product.category}`} className="text-[9px] text-primary/70 font-semibold uppercase tracking-widest hover:text-primary transition-colors">
                        {product.category}
                    </Link>
                    {hasReviews && (
                        <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] text-zinc-600 font-bold">{product.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Product Name */}
                <Link href={`/product/${product.slug}`} className="block flex-1">
                    <h3 className="text-[13px] md:text-sm font-semibold text-zinc-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Price + Action */}
                <div className="flex items-end justify-between gap-1 mt-auto pt-2">
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[15px] md:text-base font-extrabold text-zinc-900">
                                ₹{product.price.toLocaleString()}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-[10px] text-zinc-400 line-through">
                                    ₹{product.mrp.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {savings > 500 && (
                            <p className="text-[9px] font-bold text-emerald-600">Save ₹{savings.toLocaleString()}</p>
                        )}
                    </div>

                    {product.variants && product.variants.length > 0 ? (
                        <Link
                            href={`/product/${product.slug}`}
                            className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white hover:bg-primary active:scale-90 transition-all flex-shrink-0"
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
                            className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white hover:bg-primary active:scale-90 transition-all flex-shrink-0"
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

