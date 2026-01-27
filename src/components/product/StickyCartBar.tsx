'use client';

import React, { useState } from 'react';
import { ShoppingBag, ShoppingCart, Minus, Plus, Check, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/lib/data';

interface StickyCartBarProps {
    product: Product;
    selectedAttributes?: Record<string, string>;
    currentVariant?: ProductVariant | null;
    isReady?: boolean; // True if selection is complete
}

export function StickyCartBar({ product, selectedAttributes = {}, currentVariant, isReady = true }: StickyCartBarProps) {
    const addToCart = useStore((state) => state.addToCart);
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    const activePrice = currentVariant ? currentVariant.price : product.price;
    const activeMRP = currentVariant?.price ? (currentVariant.price * 1.3) : (product.mrp || product.price * 1.3);
    const discount = Math.round(((activeMRP - activePrice) / activeMRP) * 100);

    const handleAddToCart = () => {
        if (!isReady) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const finalName = currentVariant ? `${product.name} - ${currentVariant.name}` : product.name;

        addToCart({
            id: product.id,
            variantId: currentVariant?.id,
            name: finalName,
            price: activePrice,
            image: currentVariant?.image || product.images?.[0] || product.image,
            quantity: quantity,
            attributes: selectedAttributes
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if (!isReady) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setBuyingNow(true);
        const finalName = currentVariant ? `${product.name} - ${currentVariant.name}` : product.name;

        addToCart({
            id: product.id,
            variantId: currentVariant?.id,
            name: finalName,
            price: activePrice,
            image: currentVariant?.image || product.images?.[0] || product.image,
            quantity: quantity,
            attributes: selectedAttributes
        });
        setTimeout(() => {
            router.push('/cart');
        }, 300);
    };

    const incrementQty = () => setQuantity(prev => Math.min(prev + 1, 10));
    const decrementQty = () => setQuantity(prev => Math.max(prev - 1, 1));

    return (
        <>
            {/* Mobile Sticky Bar - positioned at bottom (now that global nav is hidden) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden w-full max-w-full overflow-hidden pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center gap-3 p-3">
                    {/* Price */}
                    <div className="flex flex-col min-w-0 flex-shrink-0">
                        {discount > 0 && (
                            <div className="flex items-center gap-1.5 leading-none mb-0.5">
                                <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/80">₹{activeMRP.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1 rounded-sm">{discount}% OFF</span>
                            </div>
                        )}
                        <span className="text-xl font-black leading-none tracking-tight">₹{activePrice.toLocaleString()}</span>
                    </div>

                    {/* Quantity Selector - Compact */}
                    <div className="flex items-center bg-muted/60 rounded-lg flex-shrink-0 h-9">
                        <button
                            onClick={decrementQty}
                            className="w-7 h-full flex items-center justify-center text-muted-foreground active:scale-90 disabled:opacity-40"
                            disabled={quantity <= 1}
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center font-bold text-sm bg-transparent">{quantity}</span>
                        <button
                            onClick={incrementQty}
                            className="w-7 h-full flex items-center justify-center text-muted-foreground active:scale-90 disabled:opacity-40"
                            disabled={quantity >= 10}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 flex-1 min-w-0">
                        <button
                            className={`flex-1 h-11 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all min-w-0 ${addedToCart
                                ? 'border-green-500 text-green-600 bg-green-50'
                                : 'border-gray-200 text-gray-700 bg-white'
                                }`}
                            onClick={handleAddToCart}
                            disabled={addedToCart}
                        >
                            {addedToCart ? (
                                <Check className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                            )}
                        </button>
                        <button
                            className="flex-[1.5] h-11 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 min-w-0"
                            onClick={handleBuyNow}
                            disabled={buyingNow}
                        >
                            {buyingNow ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4 flex-shrink-0 fill-white/20" />
                                    <span>Buy Now</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
