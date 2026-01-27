"use client";

import { useState } from 'react';
import { Product, ProductVariant } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { ShoppingBag, Check, ShoppingCart } from 'lucide-react';
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
            {/* Price Display */}
            <div className="p-5 bg-card border rounded-2xl shadow-sm space-y-4">
                <div className="flex items-end flex-wrap gap-3">
                    <span className="text-4xl font-black text-foreground">₹{displayPrice.toLocaleString()}</span>
                    {discount > 0 && (
                        <div className="flex flex-col mb-1.5">
                            <span className="text-sm font-bold text-muted-foreground line-through">MRP: ₹{displayMRP.toLocaleString()}</span>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full w-fit">
                                {discount}% OFF
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">Inclusive of all taxes</p>
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

                            // TEXT BUTTON SWATCH
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

            <div className="h-px bg-border/50 w-full my-6" />

            {/* Actions */}
            <div className="flex flex-col gap-4">
                {/* Quantity Control within Actions Block */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Quantity</span>
                    <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className={cn(
                            "h-14 border-2 border-primary/20 bg-primary/5 text-primary font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group",
                            added && "bg-green-50 text-green-600 border-green-200"
                        )}
                    >
                        {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        {added ? "Added" : "Add to Cart"}
                    </button>

                    <button
                        onClick={handleBuyNow}
                        disabled={!allAttributesSelected && product.attributes && product.attributes.length > 0}
                        className="h-14 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingBag className="w-5 h-5 fill-white/20" />
                        Buy Now
                    </button>
                </div>

                {/* Stock Warning */}
                {displayStock < 5 && displayStock > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl justify-center animate-pulse mt-2">
                        <span>🔥 Hurry! Only {displayStock} left at this price!</span>
                    </div>
                )}
            </div>
        </div>
    );
}
