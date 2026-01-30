"use client";

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Zap } from 'lucide-react';
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

    return (
        <div className={cn("relative group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 min-w-[160px] md:min-w-[220px] overflow-hidden", className)}>
            {/* Wishlist Button */}
            <div className="absolute top-3 right-3 z-10">
                <WishlistButton productId={product.id} size="sm" />
            </div>

            <Link href={`/product/${product.slug}`} className="block">
                {/* Image Container */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900">
                    {/* Top Left Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {/* Discount Badge */}
                        {discount > 5 && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                                {discount}% OFF
                            </span>
                        )}
                        {/* Tag Badge */}
                        {product.tag && (
                            <span className={cn(
                                "text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg",
                                product.tag.toLowerCase() === 'new' && "bg-gradient-to-r from-emerald-500 to-teal-500",
                                product.tag.toLowerCase() === 'best seller' && "bg-gradient-to-r from-amber-500 to-orange-500",
                                !['new', 'best seller'].includes(product.tag.toLowerCase()) && "bg-black/70 backdrop-blur-sm"
                            )}>
                                {product.tag.toLowerCase() === 'best seller' && <Zap className="w-2.5 h-2.5 inline mr-0.5" />}
                                {product.tag}
                            </span>
                        )}
                    </div>

                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                    {/* Rating or New Arrival */}
                    {hasReviews ? (
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded">
                                <span>{product.rating.toFixed(1)}</span>
                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                            </div>
                            <span className="text-[10px] md:text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
                        </div>
                    ) : (
                        <span className="text-[10px] md:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            ✨ New Arrival
                        </span>
                    )}

                    <h3 className="text-sm font-semibold line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    {/* Price Section */}
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                            )}
                        </div>
                        <span className="text-lg font-black text-gray-900 dark:text-gray-100">₹{product.price.toLocaleString()}</span>
                        {/* Savings */}
                        {savings > 100 && (
                            <span className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-medium">
                                You save ₹{savings.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            {/* Quick Add Button */}
            {product.variants && product.variants.length > 0 ? (
                <Link
                    href={`/product/${product.slug}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary/5 to-orange-500/5 dark:from-primary/10 dark:to-orange-500/10 text-sm font-bold text-primary rounded-b-2xl border-t border-gray-100 dark:border-zinc-800 hover:from-primary hover:to-orange-500 hover:text-white transition-all duration-300 active:scale-95"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Choose Options
                </Link>
            ) : (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            quantity: 1,
                            attributes: {}
                        });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary/5 to-orange-500/5 dark:from-primary/10 dark:to-orange-500/10 text-sm font-bold text-primary rounded-b-2xl border-t border-gray-100 dark:border-zinc-800 hover:from-primary hover:to-orange-500 hover:text-white transition-all duration-300 active:scale-95"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                </button>
            )}
        </div>
    );
}
