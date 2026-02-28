"use client";

import { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { ShoppingBag, Check, ShoppingCart, CheckCircle2, Gauge, Weight, Gamepad2, Baby, Ticket, Timer, Flame, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { trackFbEvent } from '@/components/tracking/FacebookPixel';
import { mapToGA4Item, trackEvent } from '@/components/tracking/GoogleTracking';
import { StockUrgency } from './StockUrgency';

import { BISCertificateModal } from './BISCertificateModal';

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
    const [isBISModalOpen, setIsBISModalOpen] = useState(false);

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
        trackEvent('add_to_cart', {
            currency: 'INR',
            value: finalPrice * quantity,
            items: [mapToGA4Item({
                id: product.id,
                variantId: currentVariant?.id,
                name: finalName,
                price: finalPrice,
                quantity: quantity,
                category: product.category,
                attributes: selectedAttributes
            })]
        });


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
        <div className="space-y-3 lg:space-y-5">
            {/* Price — FIRST, no card border */}
            <div>
                {/* Today's Special — small inline badge above price */}
                {isGlobalSaleActive && timeLeft && (
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase text-red-600 tracking-wider flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Today's Special
                        </span>
                        <span className="text-[10px] font-mono font-black text-gray-500 tabular-nums">{timeLeft}</span>
                    </div>
                )}

                {displayRegularPrice ? (() => {
                    const totalSaved = displayMRP - displayPrice;
                    const totalOffPercent = Math.round((totalSaved / displayMRP) * 100);
                    const extraSaved = displayRegularPrice - displayPrice;
                    return (
                        <div className="space-y-1">
                            {/* Main price + total % off MRP */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">
                                    ₹{displayPrice.toLocaleString()}
                                </span>
                                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    {totalOffPercent}% OFF
                                </span>
                                <span className="text-[9px] font-medium text-green-600">incl. taxes</span>
                            </div>
                            {/* MRP + Our Price labels */}
                            <div className="flex items-center gap-3 text-[11px]">
                                <span className="text-gray-400">
                                    MRP <span className="line-through font-bold">₹{displayMRP.toLocaleString()}</span>
                                </span>
                                <span className="text-gray-400">
                                    Our Price <span className="line-through font-bold">₹{displayRegularPrice.toLocaleString()}</span>
                                </span>
                            </div>
                            {/* Total savings callout */}
                            <div className="text-[11px] font-bold text-green-700">
                                🎉 You save ₹{totalSaved.toLocaleString()} (₹{extraSaved.toLocaleString()} extra today!)
                            </div>
                        </div>
                    );
                })() : (
                    <div className="space-y-0.5">
                        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
                            <span className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">
                                ₹{displayPrice.toLocaleString()}
                            </span>
                            {displayMRP > displayPrice && (
                                <>
                                    <span className="text-xs text-gray-400 line-through">MRP ₹{displayMRP.toLocaleString()}</span>
                                    <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                        {Math.round(((displayMRP - displayPrice) / displayMRP) * 100)}% OFF
                                    </span>
                                </>
                            )}
                            <span className="text-[9px] font-medium text-green-600">incl. taxes</span>
                        </div>
                        {displayMRP > displayPrice && (
                            <div className="text-[11px] font-bold text-green-700">
                                You save ₹{(displayMRP - displayPrice).toLocaleString()}
                            </div>
                        )}
                    </div>
                )}
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

            {/* Stock — slim inline text */}
            {displayStock <= 10 && (
                <p className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Only {displayStock} left — selling fast!
                </p>
            )}



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

                {/* PREPAID5 */}
                <div className="flex items-center gap-2 bg-green-50/80 border border-dashed border-green-300 rounded-lg px-2.5 py-1.5 animate-pulse [animation-duration:3s]">
                    <Ticket className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="text-[10px] font-bold text-green-800">Extra 5% OFF — use <span className="bg-white px-1.5 py-0.5 rounded border border-green-200 font-black tracking-wide">PREPAID5</span></span>
                </div>

                {/* Payment Trust Badges */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Safe & Secure Payments</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* COD */}
                        <span className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1 text-[10px] font-black text-gray-700 shadow-sm">
                            💵 COD
                        </span>
                        {/* UPI */}
                        <span className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1 text-[10px] font-black text-gray-700 shadow-sm">
                            <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="8" fill="#fff" />
                                <path d="M24 8L8 28h16v12l16-20H24V8z" fill="#097939" />
                                <path d="M24 8L8 28h16v12l16-20H24V8z" fill="url(#upi_grad)" opacity="0.6" />
                                <defs><linearGradient id="upi_grad" x1="8" y1="8" x2="40" y2="40"><stop stopColor="#FF6B00" /><stop offset="1" stopColor="#097939" /></linearGradient></defs>
                            </svg>
                            UPI
                        </span>
                        {/* Razorpay */}
                        <span className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1 text-[10px] font-black text-[#2B85FF] shadow-sm">
                            <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="8" fill="#2B85FF" />
                                <polygon points="14,36 26,12 34,24 22,24" fill="white" />
                                <polygon points="22,24 30,36 34,24" fill="#A3CEFF" opacity="0.8" />
                            </svg>
                            Razorpay
                        </span>
                        {/* Visa */}
                        <span className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm">
                            <svg width="28" height="10" viewBox="0 0 50 16" xmlns="http://www.w3.org/2000/svg">
                                <text x="0" y="14" fontFamily="Arial" fontWeight="800" fontSize="16" fill="#1A1F71">VISA</text>
                            </svg>
                        </span>
                        {/* Mastercard */}
                        <span className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm">
                            <svg width="26" height="16" viewBox="0 0 42 26" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="14" cy="13" r="13" fill="#EB001B" />
                                <circle cx="28" cy="13" r="13" fill="#F79E1B" />
                                <path d="M21 5.5a13 13 0 0 1 0 15 13 13 0 0 1 0-15z" fill="#FF5F00" />
                            </svg>
                        </span>
                    </div>
                </div>

                {/* Guarantee Row */}
                <div className="grid grid-cols-4 items-center gap-2 bg-orange-50/50 border border-orange-100/70 rounded-xl px-2 py-3">
                    <a href="/shipping-policy" className="flex flex-col items-center gap-1 group">
                        <Truck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black text-gray-700 group-hover:text-primary transition-colors text-center leading-tight">Free<br />Delivery</span>
                    </a>
                    <button
                        onClick={() => setIsBISModalOpen(true)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <CheckCircle2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black text-gray-700 group-hover:text-primary transition-colors text-center leading-tight">BIS<br />Certified</span>
                    </button>
                    <a href="/warranty-policy" className="flex flex-col items-center gap-1 group">
                        <ShieldCheck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black text-gray-700 group-hover:text-primary transition-colors text-center leading-tight">1 Year<br />Warranty</span>
                    </a>
                    <a href="/refund-policy" className="flex flex-col items-center gap-1 group">
                        <RotateCcw className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black text-gray-700 group-hover:text-primary transition-colors text-center leading-tight">Easy<br />Return</span>
                    </a>
                </div>
            </div>

            <BISCertificateModal
                isOpen={isBISModalOpen}
                onClose={() => setIsBISModalOpen(false)}
            />
        </div>
    );
}
