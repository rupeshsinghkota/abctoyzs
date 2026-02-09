"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductActions } from '@/components/product/ProductActions';
import { Star, Truck, ShieldCheck, CheckCircle2, RotateCcw, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { StickyCartBar } from '@/components/product/StickyCartBar';
import { Package, Zap, Gauge, Weight, Battery, Gamepad2, Baby } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ProductMainSection({ product, boxContent = [] }: { product: Product, boxContent?: string[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for attribute selection
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};

        // 1. First check URL for pre-selected attributes
        let hasUrlParams = false;
        product.attributes?.forEach(attr => {
            const paramValue = searchParams?.get(attr.name.toLowerCase());
            if (paramValue) {
                // Find matching option (case insensitive)
                const matchedOption = attr.options.find(opt => opt.toLowerCase() === paramValue.toLowerCase());
                if (matchedOption) {
                    initial[attr.name] = matchedOption;
                    hasUrlParams = true;
                }
            }
        });

        // 2. If no URL params, fall back to defaults
        if (!hasUrlParams) {
            product.attributes?.forEach(attr => {
                if (attr.options.length > 0) {
                    initial[attr.name] = attr.options[0];
                }
            });
        }
        return initial;
    });

    // Mobile Detail Tabs State
    const [activeTab, setActiveTab] = useState<'specs' | 'box'>('specs');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

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

    // Update URL when attributes change
    useEffect(() => {
        // Build new search params based on current selected attributes
        const params = new URLSearchParams();
        Object.entries(selectedAttributes).forEach(([key, value]) => {
            params.set(key.toLowerCase(), value.toLowerCase());
        });

        // Use replaceState to update URL silently without page refresh or history bloating
        const queryString = params.toString();
        const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
        window.history.replaceState(null, '', newUrl);
    }, [selectedAttributes]);

    // Delivery Date State
    const [pincode, setPincode] = useState<string>("");
    const [estimate, setEstimate] = useState<{
        serviceable: boolean;
        formattedDate?: string;
        message?: string;
        loading: boolean;
    }>({ serviceable: false, loading: false });

    const checkDelivery = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (pincode.length !== 6) return;

        setEstimate(prev => ({ ...prev, loading: true }));
        try {
            // Parse dimensions and weight from product strings or use fallbacks
            // product.box_dimensions might be "110x60x50 cm"
            // product.gross_weight might be "25 kg"

            const parseDim = (str?: string) => {
                if (!str) return null;
                const matches = str.match(/(\d+(\.\d+)?)/g);
                return matches ? matches.map(Number) : null;
            };

            const dims = parseDim(product.box_dimensions || product.product_dimensions);
            const weightArr = parseDim(product.gross_weight || product.net_weight);

            const weight = weightArr ? weightArr[0] : 10;
            const length = dims ? dims[0] : 100;
            const breadth = (dims && dims.length > 1) ? dims[1] : 60;
            const height = (dims && dims.length > 2) ? dims[2] : 50;

            const queryParams = new URLSearchParams({
                pincode,
                weight: weight.toString(),
                length: length.toString(),
                breadth: breadth.toString(),
                height: height.toString()
            });

            const res = await fetch(`/api/shipping/estimate?${queryParams.toString()}`);
            const data = await res.json();
            if (data.serviceable) {
                setEstimate({
                    serviceable: true,
                    formattedDate: data.formattedDate,
                    loading: false
                });
            } else {
                setEstimate({
                    serviceable: false,
                    message: data.message || 'Not serviceable',
                    loading: false
                });
            }
        } catch (error) {
            setEstimate({
                serviceable: false,
                message: 'Failed to check',
                loading: false
            });
        }
    };

    // Initial estimate for Delhi if no pincode
    useEffect(() => {
        // Fallback to a generic 4-5 day estimate if no pincode checked
        // but hide if a real check happened
    }, []);

    // ... (rest of component)

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

                            {/* Pincode Check Widget */}
                            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-widest">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Check Delivery
                                    </div>
                                    {estimate.serviceable && (
                                        <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Serviceable
                                        </span>
                                    )}
                                </div>

                                <form onSubmit={checkDelivery} className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter Pincode"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                        className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={pincode.length !== 6 || estimate.loading}
                                        className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary transition-all disabled:opacity-50"
                                    >
                                        {estimate.loading ? '...' : 'Check'}
                                    </button>
                                </form>

                                {estimate.loading && (
                                    <p className="text-[10px] font-medium text-zinc-400 animate-pulse">Calculating delivery date...</p>
                                )}

                                {estimate.serviceable ? (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Truck className="w-4 h-4 text-primary" />
                                        <span className="font-bold text-zinc-900">
                                            Get it by <span className="text-primary">{estimate.formattedDate}</span>
                                        </span>
                                    </div>
                                ) : estimate.message ? (
                                    <p className="text-[10px] font-bold text-red-500">{estimate.message}</p>
                                ) : (
                                    <p className="text-[10px] font-medium text-zinc-400 italic">Enter pincode to see express delivery date</p>
                                )}
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

                        {/* Mobile Content Switcher (Specs vs Box Content) */}
                        <div className="lg:hidden space-y-6 pb-8 pt-6 border-t mt-4">
                            {/* Tab Headers */}
                            <div className="flex p-1 bg-gray-100/80 rounded-2xl">
                                <button
                                    onClick={() => setActiveTab('specs')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all",
                                        activeTab === 'specs'
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <Gauge className="w-4 h-4" />
                                    TECH SPECS
                                </button>
                                <button
                                    onClick={() => setActiveTab('box')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all",
                                        activeTab === 'box'
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <Package className="w-4 h-4" />
                                    WHAT'S INSIDE?
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[300px]">
                                {activeTab === 'specs' ? (
                                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <ProductSpecs
                                            specs={product.specs}
                                            additionalInfo={{
                                                "Voltage": product.voltage,
                                                "Recommended Age": product.ageGroup,
                                                "Category": product.category?.charAt(0).toUpperCase() + product.category?.slice(1)
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                )}
                            </div>

                            <div className="pb-24 scroll-mt-24" ref={descriptionRef}>
                                <div className="text-center mb-6">
                                    <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider">
                                        In-Depth Review
                                    </span>
                                    <h3 className="text-xl font-black mt-2">About This Ride-On</h3>
                                </div>
                                <div className={cn(
                                    "prose premium-prose max-w-none px-1 relative overflow-hidden transition-all duration-500 ease-in-out",
                                    isDescriptionExpanded ? "max-h-none" : "max-h-[800px]"
                                )}>
                                    {product.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                    ) : (
                                        <p>Premium ride-on toy with advanced features.</p>
                                    )}

                                    {/* Gradient Mask for collapsed state */}
                                    {!isDescriptionExpanded && (
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
                                    )}
                                </div>

                                {/* Toggle Button */}
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => {
                                            if (isDescriptionExpanded) {
                                                setIsDescriptionExpanded(false);
                                                // Smooth scroll back to title
                                                descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            } else {
                                                setIsDescriptionExpanded(true);
                                            }
                                        }}
                                        className="text-xs font-black text-primary border border-primary/20 bg-primary/5 px-6 py-2.5 rounded-full hover:bg-primary/10 transition-colors uppercase tracking-wider"
                                    >
                                        {isDescriptionExpanded ? "Show Less" : "Read Full Description"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Sticky Cart Bar (Synced with selection) */}
            <StickyCartBar
                product={product}
                selectedAttributes={selectedAttributes}
                currentVariant={currentVariant}
                isReady={true}
            />
        </div>
    );
}
