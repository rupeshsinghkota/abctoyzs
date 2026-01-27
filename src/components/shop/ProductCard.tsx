"use client";

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
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

    return (
        <div className={cn("relative group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow min-w-[160px] md:min-w-[220px]", className)}>
            {/* Wishlist Button */}
            <div className="absolute top-3 right-3 z-10">
                <WishlistButton productId={product.id} size="sm" />
            </div>

            <Link href={`/product/${product.slug}`} className="block">
                {/* Image Container */}
                <div className="aspect-square relative rounded-t-2xl overflow-hidden bg-gray-100">
                    {product.tag && (
                        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md z-10">
                            {product.tag}
                        </span>
                    )}
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{product.rating}</span>
                        <span className="text-gray-400">({product.reviews})</span>
                    </div>

                    <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
                            <span className="text-base font-bold text-gray-900 dark:text-gray-100">₹{product.price.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Quick Add Button (Mobile Friendly: Large target) */}
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
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-zinc-800 text-sm font-semibold text-primary rounded-b-2xl border-t hover:bg-primary hover:text-white transition-colors active:scale-95"
            >
                <ShoppingCart className="w-4 h-4" />
                Add
            </button>
        </div>
    );
}
