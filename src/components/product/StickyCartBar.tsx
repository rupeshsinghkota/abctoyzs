'use client';

import React, { useState } from 'react';
import { ShoppingBag, ShoppingCart, Minus, Plus, Check, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/data';

interface StickyCartBarProps {
    product: Product;
}

export function StickyCartBar({ product }: StickyCartBarProps) {
    const addToCart = useStore((state) => state.addToCart);
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    const handleAddToCart = () => {
        addToCart({ ...product, quantity, image: product.images?.[0] || product.image });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        setBuyingNow(true);
        addToCart({ ...product, quantity, image: product.images?.[0] || product.image });
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
                <div className="flex items-center gap-2 p-3">
                    {/* Price */}
                    <div className="flex flex-col min-w-0 flex-shrink-0">
                        <span className="text-lg font-black leading-tight">₹{product.price.toLocaleString()}</span>
                        <span className="text-[10px] text-green-600 font-medium">20% OFF</span>
                    </div>

                    {/* Quantity Selector - Compact */}
                    <div className="flex items-center bg-muted/60 rounded-lg flex-shrink-0">
                        <button
                            onClick={decrementQty}
                            className="w-7 h-8 flex items-center justify-center text-muted-foreground active:scale-90 disabled:opacity-40"
                            disabled={quantity <= 1}
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                        <button
                            onClick={incrementQty}
                            className="w-7 h-8 flex items-center justify-center text-muted-foreground active:scale-90 disabled:opacity-40"
                            disabled={quantity >= 10}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 flex-1 min-w-0">
                        <button
                            className={`flex-1 py-2.5 rounded-lg border-2 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all min-w-0 ${addedToCart
                                ? 'border-green-500 text-green-600 bg-green-50'
                                : 'border-gray-300 text-gray-700 bg-white'
                                }`}
                            onClick={handleAddToCart}
                            disabled={addedToCart}
                        >
                            {addedToCart ? (
                                <>
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">Added</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">Cart</span>
                                </>
                            )}
                        </button>
                        <button
                            className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 min-w-0"
                            onClick={handleBuyNow}
                            disabled={buyingNow}
                        >
                            {buyingNow ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">Buy Now</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
