"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductActions } from '@/components/product/ProductActions';
import { Star, Truck, ShieldCheck, CheckCircle2, RotateCcw, MapPin, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { StickyCartBar } from '@/components/product/StickyCartBar';
import { Package, Zap, Gauge, Weight, Battery, Gamepad2, Baby } from 'lucide-react';
import { LiveViewersBadge } from '@/components/product/LiveViewersBadge';
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
            <div className="lg:col-span-4 relative -mt-20 lg:mt-0 z-10 w-full">
                <div className="bg-white rounded-t-[40px] lg:rounded-none px-6 pt-8 pb-24 lg:pb-0 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] lg:shadow-none min-h-[50vh]">
                    <div className="lg:sticky lg:top-28 space-y-5">

                        {/* --- SCARCITY TRIGGER: Live Viewers --- */}
                        <LiveViewersBadge />

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

                                <h1 className="text-3xl md:text-3xl lg:text-4xl font-extrabold font-heading leading-tight tracking-tight text-gray-900">
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
                                {product.reviews > 0 && (
                                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                                        {product.reviews} Verified Reviews
                                    </span>
                                )}
                            </div>

                            {/* Trust Pills — Compact Horizontal Row */}
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { icon: Truck, label: 'Ships 24–48h' },
                                    { icon: ShieldCheck, label: '1-Yr Warranty' },
                                    { icon: CheckCircle2, label: 'ISI Certified' },
                                    { icon: RotateCcw, label: '10-Day Replace' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 rounded-full px-3 py-1.5">
                                        <Icon className="w-3 h-3 text-primary shrink-0" />
                                        <span className="text-[10px] font-black text-zinc-700 whitespace-nowrap">{label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Pincode Check — Compact Inline */}
                            <div className="border border-gray-100 rounded-xl p-2.5 flex flex-col gap-2 bg-gray-50/50">
                                <form onSubmit={checkDelivery} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="6-digit pincode"
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-2 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={pincode.length !== 6 || estimate.loading}
                                        className="bg-gray-900 text-white px-3 rounded-lg text-xs font-bold hover:bg-primary transition-all disabled:opacity-50"
                                    >
                                        {estimate.loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Check'}
                                    </button>
                                </form>
                                {estimate.serviceable ? (
                                    <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                                        <Truck className="w-3 h-3 shrink-0" />
                                        <span className="font-bold">Delivers by {estimate.formattedDate}</span>
                                    </div>
                                ) : estimate.message ? (
                                    <p className="text-[11px] font-medium text-red-500">{estimate.message}</p>
                                ) : (
                                    <p className="text-[10px] font-medium text-gray-400">Free delivery all over India</p>
                                )}
                            </div>

                            <ProductActions
                                product={product}
                                selectedAttributes={selectedAttributes}
                                onAttributeSelect={setSelectedAttributes}
                                currentVariant={currentVariant}
                            />
                        </div>

                        {/* Desktop Wishlist & Share */}
                        <div className="hidden lg:flex gap-4 pt-2">
                            <WishlistButton productId={product.id} size="lg" className="h-10 px-0 hover:bg-transparent text-muted-foreground hover:text-red-500 transition-all flex items-center gap-2" />
                            <span className="text-sm text-gray-300">|</span>
                            <a
                                href={`https://wa.me/918239269217?text=${encodeURIComponent(`Hi ABC Toyz, I have a question about ${product.name}.\n\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center"
                            >
                                Ask a Question
                            </a>
                        </div>

                        {/* Mobile Content Switcher (Specs vs Box Content) */}
                        <div className="lg:hidden space-y-6 pb-8 pt-6 border-t mt-4">
                            {/* Segmented Control iOS Style */}
                            <div className="flex p-1 bg-gray-100 rounded-[14px]">
                                <button
                                    onClick={() => setActiveTab('specs')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-[13px] font-bold transition-all duration-200",
                                        activeTab === 'specs'
                                            ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <Gauge className="w-4 h-4" />
                                    Tech Specs
                                </button>
                                <button
                                    onClick={() => setActiveTab('box')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-[13px] font-bold transition-all duration-200",
                                        activeTab === 'box'
                                            ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <Package className="w-4 h-4" />
                                    What's Inside?
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

                            <div className="pb-6" ref={descriptionRef}>
                                {/* Section Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Package className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Product Description</h3>
                                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                                </div>

                                {/* Scrollable Description Container */}
                                <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden border-l-4 border-l-primary">
                                    {/* Scrollable content */}
                                    <div className="max-h-[75vh] overflow-y-auto px-4 py-5">
                                        <div className="prose premium-prose max-w-none">
                                            {product.description ? (
                                                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                            ) : (
                                                <p>Premium ride-on toy with advanced features.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom fade + scroll indicator */}
                                    <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
                                        <div className="h-10 bg-gradient-to-t from-white to-transparent" />
                                    </div>
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
        </div >
    );
}
