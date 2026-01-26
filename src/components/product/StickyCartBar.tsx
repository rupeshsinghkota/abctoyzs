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
            {/* Mobile Sticky Bar - positioned ABOVE bottom nav (bottom-16 = 4rem = 64px) */}
            <div className="fixed bottom-16 left-0 right-0 z-40 bg-background border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden w-full max-w-full overflow-hidden">
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

            {/* Desktop Add to Cart Section */}
            <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t py-4">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded-lg border"
                        />
                        <div>
                            <h3 className="font-bold line-clamp-1 text-sm">{product.name}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-primary">₹{product.price.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground line-through">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Desktop Quantity Selector */}
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                            <button
                                onClick={decrementQty}
                                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-background transition-colors disabled:opacity-50"
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                            <button
                                onClick={incrementQty}
                                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-background transition-colors disabled:opacity-50"
                                disabled={quantity >= 10}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            className={`py-2.5 px-6 rounded-lg border-2 font-bold text-sm flex items-center gap-2 transition-all ${addedToCart
                                    ? 'border-green-500 text-green-600 bg-green-50'
                                    : 'border-primary text-primary hover:bg-primary/5'
                                }`}
                            onClick={handleAddToCart}
                            disabled={addedToCart}
                        >
                            {addedToCart ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Added!
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                </>
                            )}
                        </button>
                        <button
                            className="py-2.5 px-6 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                            onClick={handleBuyNow}
                            disabled={buyingNow}
                        >
                            {buyingNow ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4" />
                                    Buy Now
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
