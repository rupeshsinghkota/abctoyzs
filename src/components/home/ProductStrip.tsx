'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Star, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Product {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    reviews: number;
    tag?: string;
    mrp?: number;
}

interface ProductStripProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
}

export function ProductStrip({ title, products, viewAllLink = '/shop' }: ProductStripProps) {
    const addToCart = useStore((state) => state.addToCart);

    if (!Array.isArray(products)) {
        console.error("ProductStrip received invalid products data:", products);
        return null;
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="py-6 bg-background space-y-4">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-lg font-bold font-heading tracking-tight">{title}</h3>
                <Link href={viewAllLink} className="text-sm font-medium text-primary hover:underline">
                    View All
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
                {products.map((product) => (
                    <div key={product.id} className="flex-none w-[160px] md:w-[220px] group relative">
                        {/* Fix: Use slug for link, fallback to ID if needed but slug is preferred */}
                        <Link href={`/product/${product.slug || product.id}`} className="block space-y-3">
                            {/* Image Card */}
                            <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden border border-border/50">
                                {/* Placeholder Image Logic */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                                    {/* Ideally Next.js Image */}
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                                {product.tag && (
                                    <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                        {product.tag}
                                    </span>
                                )}
                                {/* Quick Add Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart({ ...product, quantity: 1, image: product.image }); // Basic cart item
                                    }}
                                    className="absolute bottom-2 right-2 w-8 h-8 bg-white dark:bg-black rounded-full shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors z-10"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="font-medium">{product.rating}</span>
                                    <span className="text-muted-foreground">({product.reviews})</span>
                                </div>
                                <h4 className="font-semibold text-sm leading-tight line-clamp-2 md:text-base group-hover:text-primary transition-colors">
                                    {product.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-base md:text-lg">₹{(product.price || 0).toLocaleString()}</span>
                                    {/* Use Real MRP if available, else fake it slightly for design */}
                                    <span className="text-xs text-muted-foreground line-through">
                                        ₹{(product.mrp && product.mrp > product.price ? product.mrp : product.price * 1.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
