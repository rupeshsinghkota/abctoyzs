"use client";

import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
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
                <div className="bg-white rounded-t-[32px] lg:rounded-none px-4 pt-5 pb-24 lg:px-6 lg:pt-8 lg:pb-0 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] lg:shadow-none min-h-[50vh]">
                    <div className="lg:sticky lg:top-28 space-y-3 lg:space-y-5">

                        {/* --- SCARCITY TRIGGER: Live Viewers --- */}
                        <LiveViewersBadge />

                        <div className="space-y-3 lg:space-y-4">
                            <div className="space-y-1.5 lg:space-y-2">
                                <div className="flex items-center gap-2">
                                    {product.tag && (
                                        <span className="px-1.5 py-0.5 text-[9px] font-black text-white bg-black rounded-md uppercase tracking-[0.15em]">
                                            {product.tag}
                                        </span>
                                    )}
                                    {product.rating >= 4.5 && (
                                        <span className="px-1.5 py-0.5 text-[9px] font-black text-primary bg-primary/10 rounded-md uppercase tracking-[0.15em] border border-primary/20">
                                            Top Rated
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold font-heading leading-tight tracking-tight text-gray-900">
                                    {product.name}
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "w-2.5 h-2.5",
                                                    star <= Math.round(product.rating)
                                                        ? "fill-primary text-primary"
                                                        : "fill-gray-200 text-gray-200"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-foreground ml-0.5">{product.rating || '5.0'}</span>
                                </div>
                                {product.reviews > 0 && (
                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                        {product.reviews} Reviews
                                    </span>
                                )}
                            </div>


                            <ProductActions
                                product={product}
                                selectedAttributes={selectedAttributes}
                                onAttributeSelect={setSelectedAttributes}
                                currentVariant={currentVariant}
                            />

                            {/* Quick Specs — aligned grid */}
                            {(() => {
                                const specs = [
                                    { label: 'Age', value: product.specs?.suitable_age || (product.ageGroup ? `${product.ageGroup} Yrs` : null) },
                                    { label: 'Speed', value: product.specs?.speed ? (product.specs.speed.length > 12 ? product.specs.speed.slice(0, 12) + '…' : product.specs.speed) : null },
                                    { label: 'Load', value: product.specs?.max_load },
                                    { label: 'Control', value: product.specs?.mobile_app ? 'App+Remote' : (product.specs?.remote_control ? 'Remote' : 'Manual') },
                                ].filter(s => s.value);
                                return specs.length > 0 ? (
                                    <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-3 gap-y-1.5 py-2.5 border-t border-gray-100">
                                        {specs.map((s, i) => (
                                            <Fragment key={i}>
                                                <span className="text-[10px] text-gray-400 font-medium">{s.label}</span>
                                                <span className="text-[10px] font-bold text-gray-700">{s.value}</span>
                                            </Fragment>
                                        ))}
                                    </div>
                                ) : null;
                            })()}

                            {/* Delivery Check — minimal inline */}
                            <div className="flex items-center gap-2 py-1.5 border-t border-gray-100">
                                <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <form onSubmit={checkDelivery} className="flex items-center gap-1.5 flex-1">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter pincode"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                        className="w-20 bg-transparent text-[11px] font-medium focus:outline-none placeholder:text-gray-300 border-b border-dashed border-gray-200 focus:border-primary pb-0.5"
                                    />
                                    <button
                                        type="submit"
                                        disabled={pincode.length !== 6 || estimate.loading}
                                        className="text-[10px] font-bold text-primary disabled:opacity-30 shrink-0"
                                    >
                                        {estimate.loading ? '...' : 'Check'}
                                    </button>
                                </form>
                                <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                    {estimate.serviceable
                                        ? <span className="text-green-600 font-bold">✓ {estimate.formattedDate}</span>
                                        : estimate.message
                                            ? <span className="text-red-500">{estimate.message}</span>
                                            : 'Free shipping'}
                                </span>
                            </div>

                        </div>
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

                    {/* Mobile Content Switcher */}
                    <div className="lg:hidden space-y-3 pb-4 pt-3 border-t mt-3">
                        {/* Segmented Control */}
                        <div className="flex p-0.5 bg-gray-100 rounded-xl">
                            <button
                                onClick={() => setActiveTab('specs')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-[11px] font-bold transition-all duration-200",
                                    activeTab === 'specs'
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500"
                                )}
                            >
                                <Gauge className="w-3.5 h-3.5" />
                                Specs
                            </button>
                            <button
                                onClick={() => setActiveTab('box')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-[11px] font-bold transition-all duration-200",
                                    activeTab === 'box'
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500"
                                )}
                            >
                                <Package className="w-3.5 h-3.5" />
                                In the Box
                            </button>
                        </div>

                        {/* Tab Content — no min-height */}
                        <div>
                            {activeTab === 'specs' ? (
                                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 animate-in fade-in duration-200">
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
                                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-in fade-in duration-200">
                                    <div className="divide-y divide-gray-50">
                                        {boxContent.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2.5">
                                                <div className="w-5 h-5 rounded-md bg-green-50 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pb-4" ref={descriptionRef}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
                                    <Package className="w-3 h-3 text-primary" />
                                </div>
                                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">Product Description</h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                            </div>

                            <div className="relative rounded-lg border border-gray-200 bg-white overflow-hidden border-l-3 border-l-primary">
                                <div className="max-h-[50vh] overflow-y-auto px-3 py-3">
                                    <div className="prose prose-sm premium-prose max-w-none">
                                        {product.description ? (
                                            <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                        ) : (
                                            <p>Premium ride-on toy with advanced features.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
                                    <div className="h-8 bg-gradient-to-t from-white to-transparent" />
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
