'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/shop/ProductCard';
import { ChevronRight } from 'lucide-react';
import { HorizontalScroll } from '@/components/ui/HorizontalScroll';

export function BudgetShowcase({ products }: { products: Product[] }) {
    if (!products || products.length === 0) return null;

    const [activeTab, setActiveTab] = useState<'under-10k' | '10k-20k' | 'above-20k'>('under-10k');

    const tabs = [
        { id: 'under-10k', label: 'Under ₹10k', mobileLabel: '< ₹10k', link: '/category/price/under-10k' },
        { id: '10k-20k', label: '₹10k - ₹20k', mobileLabel: '₹10k-20k', link: '/category/price/10k-20k' },
        { id: 'above-20k', label: 'Premium > ₹20k', mobileLabel: '> ₹20k', link: '/category/price/above-20k' },
    ];

    const currentTab = tabs.find(t => t.id === activeTab);

    // Filter and Sort (Low to High as requested)
    const filtered = products.filter(p => {
        if (activeTab === 'under-10k') return p.price < 10000;
        if (activeTab === '10k-20k') return p.price >= 10000 && p.price <= 20000;
        if (activeTab === 'above-20k') return p.price > 20000;
        return false;
    }).sort((a, b) => a.price - b.price);

    return (
        <section className="py-12 md:py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-4xl font-black mb-6 text-center tracking-tight">Shop By Budget</h2>

                    {/* Tabs - Centered and evenly distributed */}
                    <div className="w-full max-w-sm md:max-w-md mx-auto">
                        <div className="flex bg-zinc-100 p-1 rounded-full">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-2 rounded-full text-xs md:text-sm font-bold transition-all text-center ${activeTab === tab.id
                                            ? 'bg-black text-white shadow-md'
                                            : 'text-zinc-500 hover:text-black hover:bg-zinc-200/50'
                                        }`}
                                >
                                    <span className="md:hidden">{tab.mobileLabel}</span>
                                    <span className="hidden md:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products - Horizontal Scroll */}
                <div className="relative group">
                    <HorizontalScroll className="gap-3 md:gap-6 pb-8">
                        {filtered.map(p => (
                            <div key={p.id} className="min-w-[200px] w-[200px] md:min-w-[280px] md:w-[280px] snap-start">
                                <ProductCard product={p} className="h-full border-zinc-100 shadow-sm hover:shadow-xl" />
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="w-full text-center py-12 text-zinc-400">
                                No products found in this range.
                            </div>
                        )}

                        {/* View All Card at the end */}
                        {filtered.length > 0 && currentTab && (
                            <div className="min-w-[120px] md:min-w-[200px] snap-start flex items-center justify-center">
                                <Link href={currentTab.link} className="flex flex-col items-center gap-3 group/view text-zinc-900">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-zinc-200 flex items-center justify-center group-hover/view:border-black group-hover/view:bg-black group-hover/view:text-white transition-all">
                                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <span className="font-bold text-xs md:text-sm uppercase tracking-wider text-center">View All<br /><span className="text-[10px] opacity-60 font-medium">({filtered.length}+)</span></span>
                                </Link>
                            </div>
                        )}
                    </HorizontalScroll>
                </div>
            </div>
        </section>
    );
}
