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
        <div className={cn(
            "group relative bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
            "hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-out overflow-hidden flex flex-col h-full",
            className
        )}>
            {/* Image Container with Badges */}
            <div className="relative aspect-square overflow-hidden bg-[#F9FAFB] p-4 lg:p-6 flex items-center justify-center">
                {/* Wishlist - Premium Blur Position */}
                <div className="absolute top-4 right-4 z-10">
                    <WishlistButton productId={product.id} size="sm" className="bg-white/80 backdrop-blur-md shadow-sm border-none hover:bg-white transition-all" />
                </div>

                {/* Glassmorphism Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                    {discount > 5 && (
                        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_4px_12px_-2px_rgba(239,68,68,0.3)]">
                            <span className="text-[10px] lg:text-xs font-black text-red-600 uppercase tracking-wider">-{discount}%</span>
                        </div>
                    )}
                    {product.tag && (
                        <div className={cn(
                            "backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border shadow-sm",
                            product.tag.toLowerCase() === 'new'
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                : "bg-zinc-900/10 border-zinc-900/20 text-zinc-900"
                        )}>
                            {product.tag.toLowerCase() === 'best seller' && <Zap className="w-3 h-3 fill-current" />}
                            <span className="text-[10px] lg:text-xs font-black uppercase tracking-wider">{product.tag}</span>
                        </div>
                    )}
                </div>

                <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                    />
                </Link>

                {/* Top Corner Glow Effect (Subtle) */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Content Section */}
            <div className="p-5 lg:p-6 flex flex-col flex-1 space-y-4">
                <div className="space-y-2 flex-1">
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-[10px] lg:text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <span>{product.category}</span>
                        {hasReviews && (
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-zinc-900">{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <Link href={`/product/${product.slug}`} className="block">
                        <h3 className="text-sm lg:text-base font-bold text-zinc-900 line-clamp-2 leading-tight hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* Price & Savings */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg lg:text-xl font-black text-zinc-900">₹{product.price.toLocaleString()}</span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-xs lg:text-sm text-zinc-400 line-through">₹{product.mrp.toLocaleString()}</span>
                        )}
                    </div>
                    {savings > 100 && (
                        <p className="text-[10px] lg:text-xs font-bold text-emerald-600">
                            Save ₹{savings.toLocaleString()} INSTANTLY
                        </p>
                    )}
                </div>

                {/* Premium Action Button */}
                {product.variants && product.variants.length > 0 ? (
                    <Link
                        href={`/product/${product.slug}`}
                        className="w-full group/btn relative bg-zinc-900 hover:bg-zinc-800 text-white py-3 lg:py-4 rounded-2xl flex items-center justify-center gap-2 overflow-hidden transition-all active:scale-95"
                    >
                        <span className="relative z-10 text-xs font-black uppercase tracking-widest">Select Options</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
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
                        className="w-full group/btn relative bg-zinc-900 hover:bg-zinc-800 text-white py-3 lg:py-4 rounded-2xl flex items-center justify-center gap-2 overflow-hidden transition-all active:scale-95"
                    >
                        <ShoppingCart className="w-4 h-4 relative z-10" />
                        <span className="relative z-10 text-xs font-black uppercase tracking-widest">Add To Cart</span>
                        {/* Glow on hover */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-orange-500 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-500" />
                    </button>
                )}
            </div>
        </div>
    );
}
