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
            router.push('/checkout');
        }, 300);
    };

    const incrementQty = () => setQuantity(prev => Math.min(prev + 1, 10));
    const decrementQty = () => setQuantity(prev => Math.max(prev - 1, 1));

    return (
        <>
            {/* Mobile Sticky Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden">
                {/* Price Row */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black">₹{product.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground line-through">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
                    </div>
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-muted rounded-lg">
                        <button
                            onClick={decrementQty}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                            disabled={quantity <= 1}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                        <button
                            onClick={incrementQty}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                            disabled={quantity >= 10}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Buttons Row */}
                <div className="flex gap-3 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                    <button
                        className={`flex-1 py-3.5 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all ${addedToCart
                                ? 'border-green-500 text-green-600 bg-green-50'
                                : 'border-primary text-primary hover:bg-primary/5'
                            }`}
                        onClick={handleAddToCart}
                        disabled={addedToCart}
                    >
                        {addedToCart ? (
                            <>
                                <Check className="w-5 h-5" />
                                Added!
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </>
                        )}
                    </button>
                    <button
                        className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-sm shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                        onClick={handleBuyNow}
                        disabled={buyingNow}
                    >
                        {buyingNow ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <ShoppingBag className="w-5 h-5" />
                                Buy Now
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Desktop Add to Cart Section */}
            <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div>
                            <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-primary">₹{product.price.toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground line-through">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Desktop Quantity Selector */}
                        <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
                            <button
                                onClick={decrementQty}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors disabled:opacity-50"
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="w-10 text-center font-bold">{quantity}</span>
                            <button
                                onClick={incrementQty}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors disabled:opacity-50"
                                disabled={quantity >= 10}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            className={`py-3 px-8 rounded-xl border-2 font-bold flex items-center gap-2 transition-all ${addedToCart
                                    ? 'border-green-500 text-green-600 bg-green-50'
                                    : 'border-primary text-primary hover:bg-primary/5'
                                }`}
                            onClick={handleAddToCart}
                            disabled={addedToCart}
                        >
                            {addedToCart ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </>
                            )}
                        </button>
                        <button
                            className="py-3 px-8 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all flex items-center gap-2"
                            onClick={handleBuyNow}
                            disabled={buyingNow}
                        >
                            {buyingNow ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <ShoppingBag className="w-5 h-5" />
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
