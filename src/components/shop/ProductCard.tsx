"use client";

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Zap, Gauge, Baby, Weight, Flame, ArrowRightLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Product } from '@/lib/data';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductCardProps {
    product: Product;
    className?: string;
    priority?: boolean;
}

import { mapToGA4Item, trackEvent } from '@/components/tracking/GoogleTracking';

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
    const addToCart = useStore((state) => state.addToCart);
    const { compareItems, addToCompare, removeFromCompare } = useStore();
    const isComparing = compareItems.some(p => p.id === product.id);

    const handleSelect = () => {
        trackEvent("select_item", {
            item_list_id: "category_grid",
            item_list_name: "Category Grid",
            items: [mapToGA4Item(product)]
        });
    };

    const toggleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isComparing) {
            removeFromCompare(product.id);
        } else {
            if (compareItems.length >= 4) {
                toast.error("You can only compare up to 4 products at a time.");
                return;
            }
            addToCompare({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                slug: product.slug,
                category: product.category,
                rating: product.rating
            });
            toast.success("Added to comparison");
        }
    };

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
            {/* ──── Image ──── */}
            <Link
                href={`/product/${product.slug}`}
                className="relative block aspect-square overflow-hidden bg-zinc-100"
                onClick={handleSelect}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.preventDefault()}>
                    <div className="flex flex-col gap-2">
                        <WishlistButton
                            productId={product.id}
                            size="sm"
                            className="bg-white/90 backdrop-blur-sm shadow-sm border-none hover:bg-white text-zinc-400 hover:text-rose-500 transition-all"
                        />
                        <button
                            onClick={toggleCompare}
                            className={cn(
                                "p-2 rounded-full transition-all bg-white/90 backdrop-blur-sm shadow-sm text-zinc-400 hover:text-primary",
                                isComparing && "bg-primary text-white scale-110 shadow-primary/20"
                            )}
                            title={isComparing ? "Remove from Comparison" : "Add to Comparison"}
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Badges — top left stack */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
                    {isNew && (
                        <span className="bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm w-fit">
                            New
                        </span>
                    )}
                    {isBestSeller && (
                        <span className="inline-flex items-center gap-0.5 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm w-fit">
                            <Flame className="w-2.5 h-2.5" /> Bestseller
                        </span>
                    )}
                    {!isNew && !isBestSeller && tag && (
                        <span className="bg-zinc-700 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm w-fit">
                            {tag}
                        </span>
                    )}
                    {discount > 5 && (
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm w-fit">
                            {discount}% OFF
                        </span>
                    )}
                </div>
            </Link>

            {/* ──── Content ──── */}
            <div className="p-3 flex flex-col flex-1">
                {/* Specs — clean row with dot separators */}
                {specs.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium mb-1.5 overflow-hidden">
                        {specs.map((s, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="text-zinc-300">·</span>}
                                <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                                    <s.icon className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                                    {s.text}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Category + Rating */}
                <div className="flex items-center justify-between mb-0.5">
                    <Link
                        href={`/category/${product.category}`}
                        className="text-[9px] text-primary/70 font-semibold uppercase tracking-widest hover:text-primary transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelect();
                        }}
                    >
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
                <Link
                    href={`/product/${product.slug}`}
                    className="block flex-1 mb-2"
                    onClick={handleSelect}
                >
                    <h3 className="text-[13px] md:text-sm font-semibold text-zinc-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Price + Action */}
                <div className="flex items-end justify-between gap-1 mt-auto">
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base md:text-lg font-extrabold text-zinc-900">
                                ₹{product.price.toLocaleString()}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-[10px] text-zinc-400 line-through">
                                    ₹{product.mrp.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {savings > 500 && (
                            <p className="text-[10px] font-bold text-emerald-600">Save ₹{savings.toLocaleString()}</p>
                        )}
                    </div>

                    {product.variants && product.variants.length > 0 ? (
                        <Link
                            href={`/product/${product.slug}`}
                            onClick={handleSelect}
                            className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white hover:bg-primary active:scale-90 transition-all flex-shrink-0"
                            title="View Options"
                        >
                            <Zap className="w-3.5 h-3.5" />
                        </Link>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                trackEvent('add_to_cart', {
                                    currency: 'INR',
                                    value: product.price,
                                    items: [mapToGA4Item(product)]
                                });
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


