"use client";

import { useStore } from "@/store/useStore";
import { ProductCard } from "@/components/shop/ProductCard";
import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { Product } from "@/lib/data";

export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
    const recentlyViewed = useStore((state) => state.recentlyViewed);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Filter out the current product from the list
    const filteredItems = recentlyViewed.filter(item => item.id !== currentProductId);

    if (filteredItems.length === 0) return null;

    return (
        <section className="mt-12 lg:mt-16 border-t border-gray-100 pt-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
                    <History className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                        Recently <span className="text-primary">Viewed</span>
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">Quick access to items you liked</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-4" />
            </div>

            <div className="relative">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="min-w-[200px] md:min-w-[260px] max-w-[280px]">
                            <ProductCard
                                product={{
                                    ...item,
                                    images: [item.image],
                                    reviews: 0, // Simplified for recently viewed
                                } as unknown as Product}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
