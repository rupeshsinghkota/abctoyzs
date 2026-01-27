"use client";

import React, { useState } from 'react';
import { ShoppingBag, ShoppingCart, Minus, Plus, Check, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/data';

interface DesktopProductActionsProps {
    product: Product;
}

export function DesktopProductActions({ product }: DesktopProductActionsProps) {
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
        <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-bold text-muted-foreground">Quantity:</span>
                <div className="flex items-center bg-gray-50 rounded-lg border">
                    <button
                        onClick={decrementQty}
                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-gray-100 active:scale-95 disabled:opacity-40 rounded-l-lg transition-colors"
                        disabled={quantity <= 1}
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg tabular-nums">{quantity}</span>
                    <button
                        onClick={incrementQty}
                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-gray-100 active:scale-95 disabled:opacity-40 rounded-r-lg transition-colors"
                        disabled={quantity >= 10}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    className={`py-4 rounded-xl border-2 font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${addedToCart
                        ? 'border-green-500 text-green-600 bg-green-50'
                        : 'border-primary text-primary hover:bg-primary/5'
                        }`}
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                >
                    {addedToCart ? (
                        <>
                            <Check className="w-5 h-5" />
                            <span>Added</span>
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="w-5 h-5" />
                            <span>Add to Cart</span>
                        </>
                    )}
                </button>

                <button
                    className="py-4 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-primary/90"
                    onClick={handleBuyNow}
                    disabled={buyingNow}
                >
                    {buyingNow ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <ShoppingBag className="w-5 h-5" />
                            <span>Buy Now</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
