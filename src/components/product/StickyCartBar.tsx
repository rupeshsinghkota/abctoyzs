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
            {/* Mobile Sticky Bar - Premium Pill Style */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] lg:hidden w-full pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center gap-4 p-4">
                    {/* Price */}
                    <div className="flex flex-col min-w-0 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Total</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-gray-900 leading-none">₹{activePrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Massive Action Button */}
                    <button
                        className={cn(
                            "flex-1 h-12 rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-purple-600 text-white shadow-primary/25",
                            addedToCart && "bg-none bg-green-600"
                        )}
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
                                <ShoppingCart className="w-5 h-5 fill-white/20" />
                                <span>Add to Cart</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
