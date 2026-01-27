"use client";

import { useState } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { ShoppingBag, Check } from 'lucide-react';
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

    // Initial Price / Image / Stock comes from Product, but overrides if Variant selected
    const displayPrice = currentVariant ? currentVariant.price : product.price;
    const displayStock = currentVariant ? currentVariant.stock : 7; // Default mock stock

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
    };

    // Helper to find image for a specific option (e.g. Red) for the swatch
    const getOptionImage = (attrName: string, optionValue: string) => {
        if (!product.variants) return null;
        const variant = product.variants.find(v => v.attributes[attrName] === optionValue && v.image);
        return variant?.image;
    };

    return (
        <div className="space-y-6">
            {/* Price Display */}
            <div className="flex items-end gap-3 pb-4 border-b">
                <div className="flex flex-col">
                    <span className="text-3xl font-black text-foreground">₹{displayPrice.toLocaleString()}</span>
                </div>
                {currentVariant && displayPrice !== product.price && (
                    <span className="text-sm text-muted-foreground mb-1 line-through">Base: ₹{product.price.toLocaleString()}</span>
                )}
            </div>

            {/* Attributes Selection */}
            {product.attributes?.map((attr) => (
                <div key={attr.name} className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{attr.name}</span>
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
                                            "group relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all shadow-sm hover:scale-105",
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

                            // COLOR SWATCH (Heuristic check for colors if no image)
                            // If the attribute name contains "Color" and option is a valid CSS color... 
                            // Simplified for now: just Text Buttons but styled better.

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleAttributeSelect(attr.name, option)}
                                    className={cn(
                                        "px-5 py-2.5 text-sm font-bold rounded-xl border-2 transition-all min-w-[3rem]",
                                        isSelected
                                            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
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
            <div className="pt-4 flex flex-col gap-4">
                {/* Quantity Control (Added for consistency) */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-2">Quantity</span>
                    <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleAddToCart}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className="flex-1 h-14 border-2 border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Add to Cart
                    </button>

                    <button
                        onClick={() => {
                            handleAddToCart();
                            // Redirect to checkout - in real app trigger navigation properly
                            window.location.href = '/cart';
                        }}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className="flex-1 h-14 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingBag className="w-5 h-5 fill-white/20" />
                        Buy Now
                    </button>
                </div>

                {/* Stock Warning */}
                {displayStock < 5 && displayStock > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg justify-center animate-pulse">
                        <span>🔥 Hurry! Only {displayStock} left at this price!</span>
                    </div>
                )}
            </div>
            );
}
