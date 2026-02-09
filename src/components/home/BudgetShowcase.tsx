'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/shop/ProductCard';
import { ChevronRight } from 'lucide-react';

export function BudgetShowcase({ products }: { products: Product[] }) {
    if (!products || products.length === 0) return null;

    const [activeTab, setActiveTab] = useState<'under-10k' | '10k-20k' | 'above-20k'>('under-10k');

    const tabs = [
        { id: 'under-10k', label: 'Under ₹10k', link: '/category/price/under-10k' },
        { id: '10k-20k', label: '₹10k - ₹20k', link: '/category/price/10k-20k' },
        { id: 'above-20k', label: 'Premium > ₹20k', link: '/category/price/above-20k' },
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
                <div className="flex flex-col items-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-black mb-6 text-center tracking-tight">Shop By Budget</h2>

                    {/* Tabs */}
                    <div className="flex p-1.5 bg-zinc-100/80 backdrop-blur-sm rounded-full overflow-x-auto scrollbar-hide max-w-full">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 md:px-8 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-black text-white shadow-lg scale-100 ring-2 ring-black/10'
                                        : 'text-zinc-500 hover:text-black hover:bg-zinc-200/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products - Horizontal Scroll on Mobile, Grid on Desktop? 
                     User said "product should be scrollble".
                     Usually a horizontal scroll is better for "showcase" sections. 
                     I'll use a snap-scrolling row for all devices but limit width on desktop or use grid if too many?
                     User said "budget option starting from lowest in that budget going towars high also product should be scrollble".
                     I'll use a robust horizontal scroll layout for all screens to keep it consistent and "scrollable".
                 */}

                <div className="relative group">
                    <div className="flex overflow-x-auto gap-4 pb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
                        {filtered.map(p => (
                            <div key={p.id} className="min-w-[260px] md:min-w-[300px] snap-start">
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
                            <div className="min-w-[150px] md:min-w-[200px] snap-start flex items-center justify-center">
                                <Link href={currentTab.link} className="flex flex-col items-center gap-4 group/view text-zinc-900">
                                    <div className="w-16 h-16 rounded-full border-2 border-zinc-200 flex items-center justify-center group-hover/view:border-black group-hover/view:bg-black group-hover/view:text-white transition-all">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-sm uppercase tracking-wider">View All</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Fade gradients for scroll indication */}
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none md:hidden" />
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
                </div>
            </div>
        </section>
    );
}
