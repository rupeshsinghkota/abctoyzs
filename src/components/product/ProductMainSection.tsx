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
                <ImageGallery key={displayImages[0]} images={displayImages} videos={product.videos} />
            </div>

            {/* RIGHT: Info & Actions (33%) */}
            <div className="lg:col-span-4 relative -mt-12 lg:mt-0 z-10">
                <div className="bg-white rounded-t-[32px] lg:rounded-none px-6 pt-8 pb-4 lg:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:shadow-none min-h-[50vh]">
                    <div className="lg:sticky lg:top-28 space-y-8">

                        {/* Header */}
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                {product.tag && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-full uppercase tracking-widest">
                                            {product.tag}
                                        </span>
                                    </div>
                                )}

                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black font-heading leading-tight tracking-tight text-foreground">
                                    {product.name}
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                "w-3.5 h-3.5",
                                                star <= Math.round(product.rating)
                                                    ? "fill-black text-black dark:fill-white dark:text-white"
                                                    : "fill-gray-100 text-gray-100"
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground underline decoration-muted-foreground/30 underline-offset-4">
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
                        <div className="lg:hidden space-y-6 pb-8 pt-6 border-t mt-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="p-1.5 bg-primary/10 rounded-lg">
                                        <Zap className="w-4 h-4 text-primary" />
                                    </div>
                                    Key Features
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {highlights.map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center justify-center p-3 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <item.icon className="w-6 h-6 text-primary mb-2" strokeWidth={1.5} />
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">{item.label}</span>
                                            <span className="text-sm font-black text-gray-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Box Content */}
                            {boxContent && boxContent.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <div className="p-1.5 bg-orange-50 rounded-lg">
                                            <Package className="w-4 h-4 text-orange-600" />
                                        </div>
                                        What's In The Box?
                                    </h3>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="grid grid-cols-2 gap-3">
                                            {boxContent.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-3 h-3 text-green-700" />
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <ProductSpecs
                                specs={product.specs}
                                additionalInfo={{
                                    "Voltage": product.voltage,
                                    "Recommended Age": product.ageGroup,
                                }}
                            />

                            <div>
                                <h3 className="font-bold text-lg mb-2">Description</h3>
                                <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
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
