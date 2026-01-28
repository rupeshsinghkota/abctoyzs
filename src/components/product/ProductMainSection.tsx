"use client";

import { useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductActions } from '@/components/product/ProductActions';
import { Star, Truck, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { Package, Zap, Gauge, Weight, Battery, Gamepad2, Baby } from 'lucide-react';

export function ProductMainSection({ product, boxContent = [] }: { product: Product, boxContent?: string[] }) {
    // State for attribute selection
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
        // Initialize with first options
        const initial: Record<string, string> = {};
        product.attributes?.forEach(attr => {
            if (attr.options.length > 0) {
                initial[attr.name] = attr.options[0];
            }
        });
        return initial;
    });

    // Derived Variants State
    const currentVariant = useMemo(() => {
        if (!product.variants) return null;
        return product.variants.find(v => {
            return Object.entries(selectedAttributes).every(([key, value]) => v.attributes[key] === value);
        }) || null;
    }, [product.variants, selectedAttributes]);

    // Images State - Updates based on variant
    const displayImages = useMemo(() => {
        if (currentVariant?.image) {
            return [currentVariant.image, ...product.images.filter(img => img !== currentVariant.image)];
        }
        return product.images && product.images.length > 0 ? product.images : [product.image];
    }, [currentVariant, product.images, product.image]);

    // Delivery Date State (Client-side only to avoid hydration mismatch)
    const [deliveryDate, setDeliveryDate] = useState<string>("");

    useEffect(() => {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setDeliveryDate(date.toLocaleDateString('en-US', { weekday: 'long' }));
    }, []);

    // ... (return start)
    // Feature highlights for Mobile
    const highlights = [
        { icon: Battery, label: 'Battery', value: product.specs?.battery || product.voltage },
        { icon: Gauge, label: 'Speed', value: product.specs?.speed },
        { icon: Baby, label: 'Age', value: product.specs?.suitable_age || (product.ageGroup ? `${product.ageGroup} Yrs` : null) },
        { icon: Weight, label: 'Load', value: product.specs?.max_load },
        { icon: Gamepad2, label: 'Control', value: product.specs?.mobile_app ? 'App & Remote' : (product.specs?.remote_control ? 'Remote' : 'Manual') },
    ].filter(h => h.value);

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start max-w-[1600px] mx-auto">
            {/* LEFT: Gallery (66%) */}
            <div className="lg:col-span-8 bg-transparent">
                {/* Key prop ensures gallery resets/updates when images change deeply */}
                <ImageGallery
                    key={displayImages[0]}
                    images={displayImages}
                    videos={product.videos}
                />
            </div>

            {/* RIGHT: Info & Actions (33%) */}
            <div className="lg:col-span-4 relative -mt-16 lg:mt-0 z-10">
                <div className="bg-white rounded-t-[32px] lg:rounded-none px-6 pt-3 pb-4 lg:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:shadow-none min-h-[50vh]">
                    <div className="lg:sticky lg:top-28 space-y-6">

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    {product.tag && (
                                        <span className="px-2 py-0.5 text-[10px] font-black text-white bg-black rounded-md uppercase tracking-[0.2em]">
                                            {product.tag}
                                        </span>
                                    )}
                                    {product.rating >= 4.5 && (
                                        <span className="px-2 py-0.5 text-[10px] font-black text-primary bg-primary/10 rounded-md uppercase tracking-[0.2em] border border-primary/20">
                                            Top Rated
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black font-heading leading-[1.1] tracking-tighter text-foreground">
                                    {product.name}
                                </h1>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "w-3 h-3",
                                                    star <= Math.round(product.rating)
                                                        ? "fill-primary text-primary"
                                                        : "fill-gray-200 text-gray-200"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[11px] font-black text-foreground ml-1">{product.rating || '5.0'}</span>
                                </div>
                                <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                                    {product.reviews} Verified Reviews
                                </span>
                            </div>

                            <ProductActions
                                product={product}
                                selectedAttributes={selectedAttributes}
                                onAttributeSelect={setSelectedAttributes}
                                currentVariant={currentVariant}
                            />
                        </div>

                        {/* Trust Signals - Clean Row (Compact) */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                        <Truck className="w-3.5 h-3.5" />
                                        <span>Free delivery</span>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground pl-5">On all orders</p>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Warranty</span>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground pl-5">1 Year Official</p>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Returns</span>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground pl-5">7 Days Easy</p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Wishlist & Share */}
                        <div className="hidden lg:flex gap-4 pt-2">
                            <WishlistButton productId={product.id} size="lg" className="h-10 px-0 hover:bg-transparent text-muted-foreground hover:text-red-500 transition-all flex items-center gap-2" />
                            <span className="text-sm text-gray-300">|</span>
                            <button className="h-10 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                                Ask a Question
                            </button>
                        </div>

                        {/* Mobile Content Repeater (Highlights & Description & Box Content) */}
                        <div className="lg:hidden space-y-8 pb-8 pt-6 border-t mt-4">
                            {/* Mobile Technical Specs */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                                        <Gauge className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Technical Specs</h3>
                                </div>

                                <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                                    <ProductSpecs
                                        specs={product.specs}
                                        additionalInfo={{
                                            "Voltage": product.voltage,
                                            "Recommended Age": product.ageGroup,
                                            "Category": product.category?.charAt(0).toUpperCase() + product.category?.slice(1)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Mobile Box Content */}
                            {boxContent && boxContent.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-inner">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">What's Inside?</h3>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="divide-y divide-gray-50">
                                            {boxContent.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="text-center mb-6">
                                    <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider">
                                        In-Depth Review
                                    </span>
                                    <h3 className="text-xl font-black mt-2">About This Ride-On</h3>
                                </div>
                                <div className="prose premium-prose max-w-none">
                                    {product.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                    ) : (
                                        <p>Premium ride-on toy with advanced features.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
