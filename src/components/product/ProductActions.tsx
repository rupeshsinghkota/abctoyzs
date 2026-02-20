"use client";

import { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { ShoppingBag, Check, ShoppingCart, CheckCircle2, Gauge, Weight, Gamepad2, Baby, Ticket, Timer, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { trackFbEvent } from '@/components/tracking/FacebookPixel';
import { StockUrgency } from './StockUrgency';

interface ProductActionsProps {
    product: Product;
    selectedAttributes: Record<string, string>;
    onAttributeSelect: (attrs: Record<string, string>) => void;
    currentVariant: ProductVariant | null;
}

export function ProductActions({ product, selectedAttributes, onAttributeSelect, currentVariant }: ProductActionsProps) {
    const { addToCart } = useStore();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    // Initial Price / Image / Stock comes from Product, but overrides if Variant selected
    const displayPrice = currentVariant ? currentVariant.price : product.price;

    let displayMRP: number;
    if (currentVariant) {
        if (currentVariant.mrp) {
            displayMRP = currentVariant.mrp;
        } else if (currentVariant.price === product.price && product.mrp) {
            // If variant price equals base price, inherit base MRP
            displayMRP = product.mrp;
        } else {
            // Fallback calculation for variant
            displayMRP = Math.round((currentVariant.price * 1.4) / 100) * 100 - 1;
        }
    } else {
        displayMRP = product.mrp || (Math.round((product.price * 1.4) / 100) * 100 - 1);
    }

    const displayStock = currentVariant ? currentVariant.stock : 7; // Default mock stock

    // Calculate Discount
    const displayRegularPrice = currentVariant?.regular_price || product.regular_price || null;
    const isGlobalSaleActive = !!displayRegularPrice;

    // We base the percentage math on the regular selling price if it exists, otherwise standard MRP
    const basePriceForDiscountMath = displayRegularPrice || displayMRP;
    const discount = Math.round(((basePriceForDiscountMath - displayPrice) / basePriceForDiscountMath) * 100);

    // --- Countdown Timer Logic ---
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        // Only run countdown if there's an actual global discount showing
        if (!isGlobalSaleActive || discount <= 0) return;

        const updateTimer = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(23, 59, 59, 999);

            const diff = midnight.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft('00:00:00');
                return;
            }

            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [discount, isGlobalSaleActive]);

    // Check if checks pass
    const allAttributesSelected = product.attributes
        ? product.attributes.every(attr => selectedAttributes[attr.name])
        : true;

    // Handlers
    const handleAttributeSelect = (name: string, value: string) => {
        onAttributeSelect({ ...selectedAttributes, [name]: value });
    };

    const handleAddToCart = () => {
        if (!allAttributesSelected) {
            alert('Please select all options');
            return;
        }

        const finalPrice = displayPrice;
        const finalImage = currentVariant?.image || product.images[0] || product.image;
        const finalName = currentVariant ? `${product.name} - ${currentVariant.name}` : product.name;

        addToCart({
            id: product.id,
            variantId: currentVariant?.id,
            name: finalName,
            price: finalPrice,
            regularPrice: displayRegularPrice || null,
            mrp: displayMRP || null,
            image: finalImage,
            quantity: quantity,
            attributes: selectedAttributes
        });

        // Track Facebook AddToCart
        trackFbEvent('AddToCart', {
            content_name: finalName,
            content_ids: [currentVariant?.id || product.id],
            content_type: 'product',
            value: finalPrice * quantity,
            currency: 'INR',
        });

        // Track Google AddToCart
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag('event', 'add_to_cart', {
                currency: 'INR',
                value: finalPrice * quantity,
                items: [{
                    item_id: String(currentVariant?.id || product.id),
                    item_name: finalName,
                    price: finalPrice,
                    quantity: quantity
                }]
            });
        }

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (!allAttributesSelected) {
            alert('Please select all options');
            return;
        }
        handleAddToCart();
        window.location.href = '/checkout';
    };

    // Helper to find image for a specific option (e.g. Red) for the swatch
    const getOptionImage = (attrName: string, optionValue: string) => {
        if (!product.variants) return null;
        const variant = product.variants.find(v => v.attributes[attrName] === optionValue && v.image);
        return variant?.image;
    };

    // Feature highlights derived from product specs
    const highlights = [
        { icon: Baby, label: 'Age', value: product.specs?.suitable_age || (product.ageGroup ? `${product.ageGroup} Yrs` : null) },
        { icon: Gauge, label: 'Speed', value: product.specs?.speed },
        { icon: Weight, label: 'Load', value: product.specs?.max_load },
        { icon: Gamepad2, label: 'Control', value: product.specs?.mobile_app ? 'App & Remote' : (product.specs?.remote_control ? 'Remote' : 'Manual') },
    ].filter(h => h.value);

    return (
        <div className="space-y-6">
            {/* Top Section Wrapper for Desktop Reordering */}
            <div className="flex flex-col gap-2 md:gap-6">
                {/* Automotive Performance Badges - Sleek Horizontal Pills */}
                <div className="flex overflow-x-auto pb-2 -mb-2 snap-x snap-mandatory no-scrollbar gap-2 sm:flex-wrap order-1 md:order-3 w-[calc(100vw-3rem)] lg:w-auto -ml-1 pr-6 lg:pr-0 lg:-ml-0 pl-1">
                    {highlights.map((item, idx) => (
                        <div
                            key={idx}
                            className="group flex flex-none items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all duration-300 snap-center"
                        >
                            <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <item.icon className="w-3 h-3 text-primary" strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">{item.label}:</span>
                                <span className="text-[11px] font-black text-gray-900">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-gradient-to-r from-border/50 via-border to-transparent w-full order-2 md:order-2" />

                {/* TODAY'S SPECIAL OFFER BANNER */}
                {isGlobalSaleActive && timeLeft && (
                    <div className="order-2 md:order-1 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/50 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 animate-pulse">
                                <Flame className="w-5 h-5 flex-shrink-0" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase text-red-600 tracking-wider">Today's Special</span>
                                <span className="text-sm font-bold text-gray-900 leading-none mt-0.5 mb-0 pb-0">Save {discount}% on this order!</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm w-full sm:w-auto overflow-hidden">
                            <Timer className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span className="text-xs font-black text-red-600 tracking-widest uppercase truncate">Ends in: <span className="text-gray-900 font-mono text-sm ml-1 tabular-nums">{timeLeft}</span></span>
                        </div>
                    </div>
                )}

                {/* Price Display (Premium Deal Style) */}
                <div className="space-y-3 order-3 md:order-1 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
                    {displayRegularPrice ? (
                        <div className="flex flex-col gap-2">
                            {/* Tier 1: True MRP */}
                            <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Maximum Retail Price (MRP)</span>
                                <span className="text-sm font-bold text-gray-300 line-through decoration-gray-200 decoration-1">
                                    ₹{displayMRP.toLocaleString()}
                                </span>
                            </div>

                            {/* Tier 2: Normal Website Rate */}
                            <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Regular Store Price</span>
                                <span className="text-lg font-bold text-gray-400 line-through decoration-gray-300 decoration-2">
                                    ₹{displayRegularPrice.toLocaleString()}
                                </span>
                            </div>

                            <div className="h-px w-full bg-gray-100 my-1" />

                            {/* Tier 3: Today's Final Sale */}
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                                    <Flame className="w-4 h-4" /> Today's Discounted Rate
                                </span>
                                <div className="flex items-center gap-3 w-full">
                                    <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                        ₹{displayPrice.toLocaleString()}
                                    </span>
                                    <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded disabled uppercase tracking-widest shadow-sm">
                                        SAVE {discount}%
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 text-[11px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 flex-wrap py-1 rounded w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Price includes all taxes & shipping. Use PREPAID5 for extra 5% off!
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                    ₹{displayPrice.toLocaleString()}
                                </span>
                            </div>
                            {displayMRP > displayPrice && (
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-sm font-bold text-gray-500 line-through decoration-gray-300 decoration-2">
                                        MRP ₹{displayMRP.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-black text-green-600 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded-sm">
                                        <CheckCircle2 className="w-3 h-3" /> All Inclusive
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* Attributes Selection */}
            {product.attributes?.map((attr) => (
                <div key={attr.name} className="space-y-3">
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold uppercase tracking-wider text-foreground">{attr.name}</span>
                        {selectedAttributes[attr.name] && (
                            <span className="text-xs font-medium text-muted-foreground animate-in fade-in">
                                {selectedAttributes[attr.name]}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {attr.options.map((option) => {
                            const isSelected = selectedAttributes[attr.name] === option;
                            const optionImage = getOptionImage(attr.name, option);

                            // VISUAL SWATCH (Premium Image Card)
                            if (optionImage) {
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleAttributeSelect(attr.name, option)}
                                        className={cn(
                                            "group relative flex flex-col items-center gap-2 transition-all",
                                            isSelected ? "scale-100" : "scale-95 opacity-80 hover:scale-100 hover:opacity-100"
                                        )}
                                        title={option}
                                    >
                                        <div className={cn(
                                            "w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all shadow-sm relative",
                                            isSelected
                                                ? "border-primary ring-2 ring-primary/20 ring-offset-2"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}>
                                            <img src={optionImage} alt={option} className="w-full h-full object-cover" />

                                            {/* Selected Checkmark Overlay */}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                                                    <div className="bg-white rounded-full p-1 shadow-md animate-in zoom-in spin-in-12 duration-300">
                                                        <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Label below image - strictly limited width */}
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wide max-w-[64px] truncate transition-colors",
                                            isSelected ? "text-primary" : "text-muted-foreground"
                                        )}>
                                            {option}
                                        </span>
                                    </button>
                                )
                            }

                            // TEXT BUTTON SWATCH (Clean Pill)
                            return (
                                <button
                                    key={option}
                                    onClick={() => handleAttributeSelect(attr.name, option)}
                                    className={cn(
                                        "px-5 py-2.5 text-sm font-bold rounded-xl border-2 transition-all min-w-[4rem]",
                                        isSelected
                                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                                            : "border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 bg-white"
                                    )}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Scarcity / Stock Alert */}
            <div className="pt-2">
                <StockUrgency stock={displayStock} />
            </div>

            {/* Actions: Single Row (High Density) */}
            <div className="space-y-3 pt-1">
                <div className="flex gap-2 h-12">
                    {/* 1. Quantity Selector (Slimmer) */}
                    <div className="shrink-0 h-full w-20">
                        <QuantitySelector quantity={quantity} setQuantity={setQuantity} className="h-full border border-gray-200/60 rounded-xl bg-gray-50/30" />
                    </div>

                    {/* 2. Add to Cart (Icon Only) */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className={cn(
                            "aspect-square h-full bg-white border border-primary/10 text-primary rounded-xl flex items-center justify-center shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50 group",
                            added && "bg-green-600 border-green-600 text-white"
                        )}
                        title="Add To Cart"
                    >
                        {added ? <Check className="w-5 h-5" strokeWidth={3} /> : <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />}
                    </button>

                    {/* 3. Buy Now (Full) */}
                    <button
                        onClick={handleBuyNow}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className="flex-1 h-full bg-primary text-white text-sm font-black rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-md active:scale-[0.98] tracking-wider"
                    >
                        <ShoppingBag className="w-4 h-4" strokeWidth={2.5} />
                        BUY NOW
                    </button>
                </div>

                {/* --- PREPAID5 Promo Highlight --- */}
                <div className="bg-green-50/80 border border-green-200/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <Ticket className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-green-800">Extra 5% OFF on Prepaid Orders</p>
                        <p className="text-[10px] text-green-700/80 font-medium">Use code <span className="font-bold tracking-wider bg-white px-1 py-0.5 rounded shadow-sm border border-green-100">PREPAID5</span> at checkout</p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 md:gap-6 text-[9px] md:text-[10px] text-muted-foreground pt-3 font-bold uppercase tracking-wider opacity-70 border-t border-gray-100 mt-3 whitespace-nowrap overflow-x-auto no-scrollbar pb-6 lg:pb-0">
                    <div className="flex items-center gap-1.5 shrink-0"><CheckCircle2 className="w-3 h-3 text-green-600" strokeWidth={2.5} /> Secure Payment</div>
                    <div className="flex items-center gap-1.5 shrink-0"><CheckCircle2 className="w-3 h-3 text-green-600" strokeWidth={2.5} /> Fast Dispatch</div>
                    <div className="flex items-center gap-1.5 shrink-0"><CheckCircle2 className="w-3 h-3 text-green-600" strokeWidth={2.5} /> 10-Day Replacement</div>
                </div>
            </div>

            {/* MOBILE STICKY CHECKOUT BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 bg-white/90 backdrop-blur-xl border-t border-gray-200 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe">
                <div className="flex items-center gap-3 w-full max-w-md mx-auto">
                    {/* Tiny thumbnail */}
                    <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                        <img
                            src={currentVariant?.image || product.images[0] || product.image || ""}
                            alt="thumbnail"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Price info */}
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">₹{displayPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold truncate">Taxes & Shipping included</span>
                    </div>

                    {/* Buy Now (Primary action) */}
                    <button
                        onClick={handleBuyNow}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className="h-12 px-6 bg-primary text-white text-sm font-black rounded-[14px] flex items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 tracking-wide shrink-0"
                    >
                        BUY NOW
                    </button>

                </div>
            </div>
        </div>
    );
}
