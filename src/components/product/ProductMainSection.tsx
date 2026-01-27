"use client";

import { useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductActions } from '@/components/product/ProductActions';
import { Star, Truck, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { Package, Zap, Gauge, Weight, Battery, Gamepad2 } from 'lucide-react';

export function ProductMainSection({ product }: { product: Product }) {
    // STATE: Variant Selection
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(null);

    // Initial check: Select defaults? 
    // For now, start empty or maybe select first options if we want? 
    // Let's stick to empty to force user choice unless only 1 choice.

    // Effect: Find Variant based on attributes
    useEffect(() => {
        if (!product.variants || product.variants.length === 0) return;

        // Check if selection is complete for all attributes
        const allSelected = product.attributes?.every(attr => selectedAttributes[attr.name]);

        if (allSelected) {
            const matched = product.variants.find(v => {
                return Object.entries(v.attributes).every(([key, val]) => selectedAttributes[key] === val);
            });
            setCurrentVariant(matched || null);
        } else {
            setCurrentVariant(null);
        }
    }, [selectedAttributes, product.variants, product.attributes]);

    // Derived State: Images
    // If a variant is selected AND has a specific image, make it the first image.
    const displayImages = useMemo(() => {
        const baseImages = product.images && product.images.length > 0 ? product.images : [product.image];

        if (currentVariant?.image) {
            // Check if it's already in the list to avoid duplicates? 
            // Or just prepend it as the "Active View".
            // Let's prepend, filtering out duplicates if needed, or just keep it simple.
            return [currentVariant.image, ...baseImages.filter(img => img !== currentVariant.image)];
        }
        return baseImages;
    }, [product.images, product.image, currentVariant]);

    // Feature highlights for Mobile
    const highlights = [
        { icon: Battery, label: 'Battery', value: product.specs?.battery || product.voltage || '12V Power' },
        { icon: Gauge, label: 'Speed', value: product.specs?.speed || '5-8 km/h' },
        { icon: Weight, label: 'Load', value: product.specs?.max_load || '30 kg' },
        { icon: Gamepad2, label: 'Control', value: product.specs?.mobile_app ? 'App & Remote' : 'Remote' },
    ];

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
            {/* LEFT: Gallery */}
            <div className="lg:col-span-7 bg-white dark:bg-card">
                {/* Key prop ensures gallery resets/updates when images change deeply */}
                <ImageGallery key={displayImages[0]} images={displayImages} videos={product.videos} />
            </div>

            {/* RIGHT: Info & Actions */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0 px-4 lg:px-0">
                <div className="lg:sticky lg:top-24 space-y-6">

                    {/* Header */}
                    <div className="space-y-4">
                        {product.tag && (
                            <span className="px-3 py-1 text-[10px] font-bold text-white bg-primary rounded-full uppercase tracking-wider w-fit">
                                {product.tag}
                            </span>
                        )}

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black font-heading leading-tight tracking-tight text-foreground">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={cn(
                                            "w-4 h-4",
                                            star <= Math.round(product.rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-200 text-gray-200 dark:fill-gray-800 dark:text-gray-800"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">
                                {product.rating} <span className="text-gray-300 mx-1">|</span> {product.reviews} reviews
                            </span>
                        </div>

                        <ProductActions
                            product={product}
                            selectedAttributes={selectedAttributes}
                            onAttributeSelect={setSelectedAttributes}
                            currentVariant={currentVariant}
                        />
                    </div>

                    {/* Trust Signals (Desktop) */}
                    {/* Premium Trust Signals (Desktop) */}
                    <div className="hidden lg:block space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-700 dark:text-green-400">In Stock & Ready to Ship</p>
                                <p className="text-xs text-green-600/80 dark:text-green-500/80">Order now for delivery by {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Free Delivery</p>
                                    <p className="text-[10px] text-muted-foreground">All over India</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">1 Year Warranty</p>
                                    <p className="text-[10px] text-muted-foreground">Comprehensive coverage</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <WishlistButton productId={product.id} size="lg" className="h-12 flex-1 rounded-xl border-2 border-muted hover:border-primary/50 text-muted-foreground hover:text-primary transition-all" />
                            <button className="flex-[2] h-12 flex items-center justify-center gap-2 font-bold text-sm border-2 border-muted rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* Mobile Content Repeater (Highlights & Description) */}
                    <div className="lg:hidden space-y-8 pb-8">
                        <div className="space-y-3">
                            <h3 className="font-bold text-lg">Key Features</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {highlights.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border">
                                        <item.icon className="w-5 h-5 text-primary shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase">{item.label}</span>
                                            <span className="text-sm font-bold">{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ProductSpecs
                            specs={product.specs}
                            additionalInfo={{
                                "Voltage": product.voltage,
                                "Recommended Age": product.ageGroup,
                            }}
                        />

                        <div>
                            <h3 className="font-bold text-lg mb-2">Description</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {product.description || "Premium ride-on toy with advanced features."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
