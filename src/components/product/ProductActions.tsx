"use client";

import { useState } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { ShoppingBag, Check, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuantitySelector } from '@/components/ui/QuantitySelector';

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
    const displayMRP = currentVariant?.price ? (currentVariant.price * 1.3) : (product.mrp || product.price * 1.3); // Fallback mock MRP if missing
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

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (!allAttributesSelected) {
            alert('Please select all options');
            return;
        }
        handleAddToCart();
        window.location.href = '/cart';
    };

    // Helper to find image for a specific option (e.g. Red) for the swatch
    const getOptionImage = (attrName: string, optionValue: string) => {
        if (!product.variants) return null;
        const variant = product.variants.find(v => v.attributes[attrName] === optionValue && v.image);
        return variant?.image;
    };

    return (
        <div className="space-y-8">
            {/* Price Display (Clean, No Box) */}
            {/* Price Display (Compact) */}
            <div className="space-y-0.5">
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">
                        ₹{displayPrice.toLocaleString()}
                    </span>
                    {discount > 0 && (
                        <div className="flex items-baseline gap-2 leading-none">
                            <span className="text-sm font-bold text-muted-foreground line-through decoration-2 decoration-red-500/50">
                                ₹{displayMRP.toLocaleString()}
                            </span>
                            <span className="text-xs font-black text-red-600 uppercase tracking-wide">
                                {discount}% OFF
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Inclusive of all taxes
                </p>
            </div>

            <div className="h-px bg-border/40 w-full" />

            {/* Attributes Selection */}
            {product.attributes?.map((attr) => (
                <div key={attr.name} className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">{attr.name}</span>
                        <div className="flex items-center gap-2">
                            {selectedAttributes[attr.name] && (
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    {selectedAttributes[attr.name]}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {attr.options.map((option) => {
                            const isSelected = selectedAttributes[attr.name] === option;
                            const optionImage = getOptionImage(attr.name, option);

                            // VISUAL SWATCH (Image)
                            if (optionImage) {
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleAttributeSelect(attr.name, option)}
                                        className={cn(
                                            "group relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shadow-sm hover:scale-105",
                                            isSelected
                                                ? "border-primary ring-2 ring-primary/20 ring-offset-1 scale-105"
                                                : "border-transparent hover:border-border"
                                        )}
                                        title={option}
                                    >
                                        <img src={optionImage} alt={option} className="w-full h-full object-cover" />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="bg-white rounded-full p-0.5 shadow-sm"><Check className="w-3 h-3 text-primary" /></div>
                                            </div>
                                        )}
                                    </button>
                                )
                            }

                            // TEXT BUTTON SWATCH
                            return (
                                <button
                                    key={option}
                                    onClick={() => handleAttributeSelect(attr.name, option)}
                                    className={cn(
                                        "px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all min-w-[3rem]",
                                        isSelected
                                            ? "border-primary bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                            : "border-muted hover:border-foreground/20 text-muted-foreground hover:text-foreground bg-white dark:bg-zinc-900"
                                    )}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Actions */}
            <div className="space-y-6 pt-8">

                {/* Primary: Add to Cart (Gradient Glow) */}
                <button
                    onClick={handleAddToCart}
                    disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                    className={cn(
                        "relative w-full h-[72px] bg-gradient-to-r from-primary via-purple-600 to-primary background-animate text-white font-black text-2xl rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden",
                        added && "bg-none bg-green-600 shadow-green-500/30"
                    )}
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    {added ? <Check className="w-8 h-8" strokeWidth={3} /> : <ShoppingCart className="w-7 h-7 fill-white/20 group-hover:scale-110 transition-transform" strokeWidth={2.5} />}
                    {added ? "ADDED TO CART" : "ADD TO CART"}
                </button>

                {/* Secondary: Buy Now & Quantity */}
                <div className="flex gap-4 h-14">
                    <div className="shrink-0 h-full w-24">
                        <QuantitySelector quantity={quantity} setQuantity={setQuantity} className="h-full border-2 border-gray-100 rounded-xl bg-gray-50/50" />
                    </div>

                    <button
                        onClick={handleBuyNow}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className="flex-1 h-full bg-black text-white text-lg font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-900 transition-all shadow-lg active:scale-[0.98]"
                    >
                        <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
                        BUY NOW
                    </button>
                </div>

                {/* Secure Checkout Trust */}
                <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground pt-4 font-bold uppercase tracking-widest opacity-50">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Secure Payment</div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Fast Dispatch</div>
                </div>
            </div>
        </div>
    );
}
