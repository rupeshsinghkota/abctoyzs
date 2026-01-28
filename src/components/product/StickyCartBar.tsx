'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, Check, Loader2, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/lib/data';
import { cn } from '@/lib/utils';

interface StickyCartBarProps {
    product: Product;
    selectedAttributes?: Record<string, string>;
    currentVariant?: ProductVariant | null;
    isReady?: boolean;
}

export function StickyCartBar({ product, selectedAttributes = {}, currentVariant, isReady = true }: StickyCartBarProps) {
    const addToCart = useStore((state) => state.addToCart);
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const activePrice = currentVariant ? currentVariant.price : product.price;

    // MRP Logic: Explicit > Base Match > Calculation
    let activeMRP: number;
    if (currentVariant) {
        if (currentVariant.mrp) {
            activeMRP = currentVariant.mrp;
        } else if (currentVariant.price === product.price && product.mrp) {
            activeMRP = product.mrp;
        } else {
            activeMRP = Math.round((currentVariant.price * 1.4) / 100) * 100 - 1;
        }
    } else {
        activeMRP = product.mrp || (Math.round((product.price * 1.4) / 100) * 100 - 1);
    }

    const discount = Math.round(((activeMRP - activePrice) / activeMRP) * 100);

    useEffect(() => {
        const handleScroll = () => {
            // Show bar after scrolling 600px
            if (window.scrollY > 600) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            quantity: 1,
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
        handleAddToCart();
        setTimeout(() => router.push('/cart'), 300);
    };

    if (!isVisible && typeof window !== 'undefined' && window.innerWidth > 1024) return null;

    return (
        <>
            {/* MOBILE STICKY BAR - High Density & Premium */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] lg:hidden safe-area-pb transition-transform duration-300",
                isVisible ? "translate-y-0" : "translate-y-0" // Always show on mobile but could be triggered by scroll too
            )}>
                <div className="flex items-center justify-between p-3 gap-3">
                    {/* Left: Product Mini Info */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                            <img
                                src={currentVariant?.image || product.images?.[0] || product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h4 className="text-[10px] font-black text-gray-900 truncate tracking-tight">{product.name}</h4>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-black text-primary">₹{activePrice.toLocaleString()}</span>
                                {discount > 0 && (
                                    <span className="text-[8px] font-bold text-red-500">-{discount}%</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddToCart}
                            className={cn(
                                "h-11 w-11 rounded-xl flex items-center justify-center transition-all border-2",
                                addedToCart
                                    ? "bg-green-600 border-green-600 text-white"
                                    : "bg-white border-primary/10 text-primary shadow-sm active:scale-95"
                            )}
                        >
                            {addedToCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="h-11 px-6 bg-primary text-white text-xs font-black rounded-xl shadow-lg active:scale-95 transition-all tracking-wider flex items-center gap-2 hover:bg-orange-600"
                        >
                            BUY NOW
                        </button>
                    </div>
                </div>
            </div>

            {/* DESKTOP STICKY BAR - Appearing on Scroll */}
            <div className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden lg:flex items-center gap-6 px-6 py-3 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-500",
                isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95"
            )}>
                <div className="flex items-center gap-4 border-r border-white/10 pr-6">
                    <img
                        src={currentVariant?.image || product.images?.[0] || product.image}
                        alt={product.name}
                        className="w-8 h-8 rounded-md bg-white p-1"
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">You are viewing</span>
                        <span className="text-sm font-black text-white leading-none truncate max-w-[200px]">{product.name}</span>
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">₹{activePrice.toLocaleString()}</span>
                    {discount > 0 && (
                        <span className="text-xs font-bold text-primary">Save {discount}% Now</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "h-10 px-6 rounded-xl font-black text-xs transition-all flex items-center gap-2",
                            addedToCart
                                ? "bg-green-600 text-white"
                                : "bg-white text-black hover:bg-white/90"
                        )}
                    >
                        {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        {addedToCart ? 'ADDED' : 'ADD TO CART'}
                    </button>
                    <button
                        onClick={handleBuyNow}
                        className="h-10 px-8 bg-primary text-white text-xs font-black rounded-xl hover:opacity-90 transition-all tracking-wider"
                    >
                        BUY NOW
                    </button>
                </div>
            </div>
        </>
    );
}
