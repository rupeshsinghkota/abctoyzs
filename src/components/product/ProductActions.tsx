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
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <span className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">₹{displayPrice.toLocaleString()}</span>
                    {discount > 0 && (
                        <span className="text-lg font-bold text-muted-foreground line-through decoration-2 decoration-red-500/30">
                            ₹{displayMRP.toLocaleString()}
                        </span>
                    )}
                </div>
                {discount > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            {discount}% OFF
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">Inclusive of all taxes</span>
                    </div>
                )}
            </div>

            <div className="h-px bg-border/40 w-full" />

            {/* Attributes Selection */}
            {product.attributes?.map((attr) => (
                <div key={attr.name} className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm font-bold uppercase tracking-wider text-foreground">{attr.name}</span>
                        <div className="flex items-center gap-2">
                            {selectedAttributes[attr.name] && (
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    {selectedAttributes[attr.name]}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
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
                                            "group relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all shadow-sm hover:scale-105",
                                            isSelected
                                                ? "border-primary ring-2 ring-primary/20 ring-offset-2 scale-105"
                                                : "border-transparent hover:border-border"
                                        )}
                                        title={option}
                                    >
                                        <img src={optionImage} alt={option} className="w-full h-full object-cover" />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="bg-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3 text-primary" /></div>
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
                                        "px-6 py-3 text-sm font-bold rounded-xl border-2 transition-all min-w-[3rem]",
                                        isSelected
                                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/25 scale-105"
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
            <div className="space-y-4 pt-4">

                {/* Row 1: Quantity + Add to Cart */}
                <div className="flex gap-4 h-14">
                    <div className="shrink-0 h-full">
                        <QuantitySelector quantity={quantity} setQuantity={setQuantity} className="h-full border-2 border-muted rounded-2xl bg-white" />
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className={cn(
                            "flex-1 h-full border-2 border-primary/10 bg-primary/5 text-primary font-black text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group",
                            added && "bg-green-50 text-green-600 border-green-200"
                        )}
                    >
                        {added ? <Check className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                        {added ? "Added" : "Add to Cart"}
                    </button>
                </div>

                {/* Row 2: Buy Now (Full Width) */}
                <button
                    onClick={handleBuyNow}
                    disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                    className="w-full h-16 bg-gradient-to-r from-primary to-orange-600 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingBag className="w-6 h-6 fill-white/20" />
                    Buy Now
                </button>

                {/* Secure Checkout Trust */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground pt-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Secure Checkout by Razorpay
                </div>

                {/* Stock Warning */}
                {displayStock < 5 && displayStock > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl justify-center animate-pulse">
                        <span>🔥 Hurry! Only {displayStock} left at this price!</span>
                    </div>
                )}
            </div>
        </div>
    );
}
