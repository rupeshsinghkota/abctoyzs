'use client';

import { useState } from 'react';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/shop/ProductCard';
import { ChevronDown } from 'lucide-react';

interface ProductGridProps {
    products: Product[];
    initialCount?: number;
    loadMoreCount?: number;
}

export function ProductGrid({ products, initialCount = 8, loadMoreCount = 4 }: ProductGridProps) {
    const [visibleCount, setVisibleCount] = useState(initialCount);
    const hasMore = visibleCount < products.length;
    const visibleProducts = products.slice(0, visibleCount);
    const remaining = products.length - visibleCount;

    return (
        <div>
            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 p-4">
                {visibleProducts.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        priority={index < 4}
                    />
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center pt-4 pb-8">
                    <button
                        onClick={() => setVisibleCount(prev => Math.min(prev + loadMoreCount, products.length))}
                        className="group inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white text-sm font-bold rounded-full hover:bg-primary active:scale-95 transition-all duration-200 shadow-lg shadow-zinc-900/20 hover:shadow-primary/30"
                    >
                        <span>Load More</span>
                        <span className="text-xs opacity-70">({remaining} remaining)</span>
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                </div>
            )}

            {/* All loaded indicator */}
            {!hasMore && products.length > initialCount && (
                <div className="flex justify-center py-6">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        All {products.length} products loaded
                    </span>
                </div>
            )}
        </div>
    );
}
