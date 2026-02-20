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
        <div className="space-y-3 lg:space-y-6">
            {/* Top Section Wrapper for Desktop Reordering */}
            <div className="flex flex-col gap-2 lg:gap-6">
                {/* Automotive Performance Badges - Sleek Horizontal Pills */}
                <div className="flex overflow-x-auto pb-1 -mb-1 snap-x snap-mandatory no-scrollbar gap-1.5 lg:gap-2 sm:flex-wrap order-1 md:order-3 w-[calc(100vw-2rem)] lg:w-auto -ml-1 pr-4 lg:pr-0 lg:-ml-0 pl-1">
                    {highlights.map((item, idx) => (
                        <div
                            key={idx}
                            className="group flex flex-none items-center gap-1.5 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all duration-300 snap-center"
                        >
                            <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                <item.icon className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-primary" strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] lg:text-[10px] text-gray-500 font-bold tracking-wider uppercase">{item.label}:</span>
                                <span className="text-[10px] lg:text-[11px] font-black text-gray-900">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-gradient-to-r from-border/50 via-border to-transparent w-full order-2 md:order-2" />

                {/* TODAY'S SPECIAL OFFER BANNER */}
                {isGlobalSaleActive && timeLeft && (
                    <div className="order-2 md:order-1 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/50 rounded-lg p-2 lg:p-3 flex items-center justify-between gap-2 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-red-100 text-red-600 animate-pulse shrink-0">
                                <Flame className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] lg:text-xs font-black uppercase text-red-600 tracking-wider leading-none">Today's Special</span>
                                <span className="text-xs lg:text-sm font-bold text-gray-900 leading-none mt-0.5">Save {discount}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-md shadow-sm shrink-0">
                            <Timer className="w-3 h-3 lg:w-4 lg:h-4 text-red-500" />
                            <span className="text-[10px] lg:text-xs font-black text-red-600 tracking-wider uppercase"><span className="text-gray-900 font-mono tabular-nums">{timeLeft}</span></span>
                        </div>
                    </div>
                )}

                {/* Price Display */}
                <div className="space-y-2 order-3 md:order-1 bg-white p-3 lg:p-5 rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm">
                    {displayRegularPrice ? (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-gray-400 font-bold uppercase line-through">MRP ₹{displayMRP.toLocaleString()}</span>
                                <span className="text-xs text-gray-400 font-bold line-through">₹{displayRegularPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">
                                    ₹{displayPrice.toLocaleString()}
                                </span>
                                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                    SAVE {discount}%
                                </span>
                            </div>
                            <div className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                All taxes & shipping included
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">
                                ₹{displayPrice.toLocaleString()}
                            </span>
                            {displayMRP > displayPrice && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-gray-400 line-through">MRP ₹{displayMRP.toLocaleString()}</span>
                                    <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded">All Inclusive</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* Attributes Selection */}
            {product.attributes?.map((attr) => (
                <div key={attr.name} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">{attr.name}</span>
                        {selectedAttributes[attr.name] && (
                            <span className="text-[10px] font-medium text-muted-foreground animate-in fade-in">
                                {selectedAttributes[attr.name]}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {attr.options.map((option) => {
                            const isSelected = selectedAttributes[attr.name] === option;
                            const optionImage = getOptionImage(attr.name, option);

                            if (optionImage) {
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleAttributeSelect(attr.name, option)}
                                        className={cn(
                                            "group relative flex flex-col items-center gap-1 transition-all",
                                            isSelected ? "scale-100" : "scale-95 opacity-80 hover:scale-100 hover:opacity-100"
                                        )}
                                        title={option}
                                    >
                                        <div className={cn(
                                            "w-14 h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden border-2 transition-all shadow-sm relative",
                                            isSelected
                                                ? "border-primary ring-2 ring-primary/20 ring-offset-1"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}>
                                            <img src={optionImage} alt={option} className="w-full h-full object-cover" />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                                                    <div className="bg-white rounded-full p-0.5 shadow-md animate-in zoom-in">
                                                        <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wide max-w-[56px] truncate",
                                            isSelected ? "text-primary" : "text-muted-foreground"
                                        )}>
                                            {option}
                                        </span>
                                    </button>
                                )
                            }

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleAttributeSelect(attr.name, option)}
                                    className={cn(
                                        "px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all",
                                        isSelected
                                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                                            : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
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
            <div className="pt-1">
                <StockUrgency stock={displayStock} />
            </div>

            {/* Actions Row */}
            <div className="space-y-2 pt-1">
                <div className="flex gap-2 h-10 lg:h-12">
                    <div className="shrink-0 h-full w-16 lg:w-20">
                        <QuantitySelector quantity={quantity} setQuantity={setQuantity} className="h-full border border-gray-200/60 rounded-lg lg:rounded-xl bg-gray-50/30" />
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className={cn(
                            "aspect-square h-full bg-white border border-primary/10 text-primary rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50 group",
                            added && "bg-green-600 border-green-600 text-white"
                        )}
                        title="Add To Cart"
                    >
                        {added ? <Check className="w-4 h-4" strokeWidth={3} /> : <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />}
                    </button>
                    <button
                        onClick={handleBuyNow}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className="flex-1 h-full bg-primary text-white text-xs lg:text-sm font-black rounded-lg lg:rounded-xl flex items-center justify-center gap-1.5 hover:bg-orange-600 transition-all shadow-md active:scale-[0.98] tracking-wider"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2.5} />
                        BUY NOW
                    </button>
                </div>

                {/* PREPAID5 Promo */}
                <div className="bg-green-50/80 border border-green-200/50 rounded-lg p-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <Ticket className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-green-800 leading-none">Extra 5% OFF on Prepaid</p>
                        <p className="text-[9px] text-green-700/80 font-medium leading-none mt-0.5">Use <span className="font-bold bg-white px-1 py-0.5 rounded border border-green-100 text-[9px]">PREPAID5</span></p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-[8px] lg:text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-70 border-t border-gray-100 pt-2 whitespace-nowrap overflow-x-auto no-scrollbar pb-6 lg:pb-0">
                    <div className="flex items-center gap-1 shrink-0"><CheckCircle2 className="w-2.5 h-2.5 text-green-600" strokeWidth={2.5} /> Secure Payment</div>
                    <div className="flex items-center gap-1 shrink-0"><CheckCircle2 className="w-2.5 h-2.5 text-green-600" strokeWidth={2.5} /> Fast Dispatch</div>
                    <div className="flex items-center gap-1 shrink-0"><CheckCircle2 className="w-2.5 h-2.5 text-green-600" strokeWidth={2.5} /> 10-Day Replace</div>
                </div>
            </div>

            {/* MOBILE STICKY BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] p-2 bg-white/90 backdrop-blur-xl border-t border-gray-200 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe">
                <div className="flex items-center gap-2 w-full max-w-md mx-auto">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                        <img
                            src={currentVariant?.image || product.images[0] || product.image || ""}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-lg font-black tracking-tighter text-gray-900 leading-none">₹{displayPrice.toLocaleString()}</span>
                        <span className="text-[8px] text-gray-500 font-bold truncate">Taxes & shipping incl.</span>
                    </div>
                    <button
                        onClick={handleBuyNow}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className="h-10 px-5 bg-primary text-white text-xs font-black rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 tracking-wide shrink-0"
                    >
                        BUY NOW
                    </button>
                </div>
            </div>
        </div>
    );
}
