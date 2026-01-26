'use client';

import React from 'react';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Product } from '@/lib/data';

interface StickyCartBarProps {
    product: Product;
}

export function StickyCartBar({ product }: StickyCartBarProps) {
    const addToCart = useStore((state) => state.addToCart);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
            <div className="flex gap-3">
                <button
                    className="flex-1 py-3 px-4 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/5 active:scale-95 transition-all"
                    onClick={() => addToCart({ ...product, quantity: 1, image: product.images[0] })}
                >
                    Add to Cart
                </button>
                <button className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all">
                    Buy Now
                </button>
            </div>
        </div>
    );
}
