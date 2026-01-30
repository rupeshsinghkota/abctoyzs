'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Star, ShoppingBag, Heart, Zap } from 'lucide-react';
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
    age_range?: string;
    is_featured?: boolean;
    variants?: any[];
}

interface ProductStripProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
}

export function ProductStrip({ title, products, viewAllLink = '/shop' }: ProductStripProps) {
    const addToCart = useStore((state) => state.addToCart);
    const [wishlist, setWishlist] = React.useState<Set<string>>(new Set());

    const toggleWishlist = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        setWishlist(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const calculateDiscount = (price: number, mrp?: number) => {
        const actualMrp = mrp && mrp > price ? mrp : price * 1.2;
        return Math.round(((actualMrp - price) / actualMrp) * 100);
    };

    const calculateSavings = (price: number, mrp?: number) => {
        const actualMrp = mrp && mrp > price ? mrp : price * 1.2;
        return Math.round(actualMrp - price);
    };

    return (
        <section className="py-6 bg-background space-y-4">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-lg font-bold font-heading tracking-tight">{title}</h3>
                <Link href={viewAllLink} className="text-sm font-medium text-primary hover:underline">
                    View All
                </Link>
            </div>

            <div className="flex gap-3 md:gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
                {products.map((product) => {
                    const discount = calculateDiscount(product.price, product.mrp);
                    const savings = calculateSavings(product.price, product.mrp);
                    const isWishlisted = wishlist.has(product.id);
                    const hasReviews = product.reviews > 0;
                    const mrpValue = product.mrp && product.mrp > product.price ? product.mrp : product.price * 1.2;
                    const hasVariants = product.variants && product.variants.length > 0;

                    return (
                        <div key={product.id} className="flex-none w-[155px] md:w-[220px] group">
                            <Link href={`/product/${product.slug || product.id}`} className="block">
                                {/* Image Container */}
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-xl transition-all duration-300">
                                    {/* Product Image */}
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    {/* Gradient Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Top Left Badges */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
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
                                                product.tag === 'New' && "bg-gradient-to-r from-emerald-500 to-teal-500",
                                                product.tag === 'Best Seller' && "bg-gradient-to-r from-amber-500 to-orange-500",
                                                !['New', 'Best Seller'].includes(product.tag) && "bg-black/70 backdrop-blur-sm"
                                            )}>
                                                {product.tag === 'Best Seller' && <Zap className="w-2.5 h-2.5 inline mr-0.5" />}
                                                {product.tag}
                                            </span>
                                        )}
                                    </div>

                                    {/* Top Right - Wishlist Button */}
                                    <button
                                        onClick={(e) => toggleWishlist(e, product.id)}
                                        className={cn(
                                            "absolute top-2 right-2 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                                            isWishlisted
                                                ? "bg-red-500 text-white scale-110"
                                                : "bg-white/90 dark:bg-black/70 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500"
                                        )}
                                    >
                                        <Heart className={cn("w-4 h-4 md:w-5 md:h-5", isWishlisted && "fill-current")} />
                                    </button>

                                    {/* Bottom - Quick Add Button */}
                                    {hasVariants ? (
                                        <span
                                            className="absolute bottom-2 left-2 right-2 py-2 md:py-2.5 bg-white/95 dark:bg-black/90 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 font-semibold text-xs md:text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white shadow-lg"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            <span className="hidden md:inline">Choose Options</span>
                                            <span className="md:hidden">Options</span>
                                        </span>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart({ ...product, quantity: 1, image: product.image });
                                            }}
                                            className="absolute bottom-2 left-2 right-2 py-2 md:py-2.5 bg-white/95 dark:bg-black/90 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 font-semibold text-xs md:text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white shadow-lg"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            <span className="hidden md:inline">Add to Cart</span>
                                            <span className="md:hidden">Add</span>
                                        </button>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="mt-3 space-y-1.5 px-0.5">
                                    {/* Rating or New Badge */}
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

                                    {/* Product Name */}
                                    <h4 className="font-semibold text-sm md:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h4>

                                    {/* Price Section */}
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-black text-lg md:text-xl">₹{(product.price || 0).toLocaleString()}</span>
                                            <span className="text-xs md:text-sm text-muted-foreground line-through">
                                                ₹{mrpValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        {/* Savings Text */}
                                        {savings > 100 && (
                                            <span className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-medium">
                                                You save ₹{savings.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
