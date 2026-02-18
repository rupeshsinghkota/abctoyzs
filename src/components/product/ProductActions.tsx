"use client";

import { useState } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { ShoppingBag, Check, ShoppingCart, CheckCircle2, Gauge, Weight, Gamepad2, Baby } from 'lucide-react';
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
    const discount = Math.round(((displayMRP - displayPrice) / displayMRP) * 100);

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
                {/* Automotive Performance Badges - Order changes on desktop */}
                <div className="flex overflow-x-auto pb-2 -mb-2 snap-x snap-mandatory no-scrollbar gap-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:pb-0 sm:mb-0 order-1 md:order-3">
                    {highlights.map((item, idx) => (
                        <div
                            key={idx}
                            className="group flex flex-1 min-w-[130px] sm:min-w-0 items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 border border-gray-100/80 hover:bg-white hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300 snap-center"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <item.icon className="w-4 h-4 text-primary" strokeWidth={2} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[8px] text-muted-foreground font-black tracking-widest uppercase truncate">{item.label}</span>
                                <span className="text-[10px] font-black text-gray-900 truncate">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-gradient-to-r from-border/50 via-border to-transparent w-full order-2 md:order-2" />

                {/* Price Display (Premium Deal Style) */}
                <div className="space-y-2 order-3 md:order-1">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">
                                ₹{displayPrice.toLocaleString()}
                            </span>
                            {discount > 0 && (
                                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider box-decoration-clone shadow-sm">
                                    Save {discount}%
                                </span>
                            )}
                        </div>
                        {discount > 0 && (
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-bold text-gray-500 line-through decoration-gray-400 decoration-2">
                                    MRP ₹{displayMRP.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-black text-green-600 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded-sm">
                                    <CheckCircle2 className="w-3 h-3" /> All Inclusive
                                </span>
                            </div>
                        )}
                    </div>
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

                <div className="flex items-center justify-center gap-3 md:gap-6 text-[9px] md:text-[10px] text-muted-foreground pt-3 font-bold uppercase tracking-wider opacity-70 border-t border-gray-100 mt-3 whitespace-nowrap overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 shrink-0"><CheckCircle2 className="w-3 h-3 text-green-600" strokeWidth={2.5} /> Secure Payment</div>
                    <div className="flex items-center gap-1.5 shrink-0"><CheckCircle2 className="w-3 h-3 text-green-600" strokeWidth={2.5} /> Fast Dispatch</div>
                    <div className="flex items-center gap-1.5 shrink-0"><CheckCircle2 className="w-3 h-3 text-green-600" strokeWidth={2.5} /> 10-Day Replacement</div>
                </div>
            </div>
        </div>
    );
}
