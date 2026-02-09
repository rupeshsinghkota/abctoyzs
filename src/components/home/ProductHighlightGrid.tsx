'use client';

import Link from 'next/link';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/shop/ProductCard';
import { Star, ArrowRight } from 'lucide-react';

interface ProductHighlightGridProps {
    title: string;
    products: Product[];
    viewAllLink: string;
    description?: string;
    theme?: 'yellow' | 'blue' | 'dark';
}

export function ProductHighlightGrid({
    title,
    products,
    viewAllLink,
    description = "Rated 4.5+ by our happy customers",
    theme = 'yellow'
}: ProductHighlightGridProps) {

    // Theme configurations
    const themes = {
        yellow: {
            bg: 'bg-yellow-400',
            text: 'text-zinc-900',
            subtext: 'text-zinc-800/80',
            button: 'bg-zinc-900 text-white hover:bg-zinc-800',
            accent: 'text-white'
        },
        blue: {
            bg: 'bg-blue-600',
            text: 'text-white',
            subtext: 'text-blue-100',
            button: 'bg-white text-blue-600 hover:bg-blue-50',
            accent: 'text-blue-400'
        },
        dark: {
            bg: 'bg-zinc-900',
            text: 'text-white',
            subtext: 'text-zinc-400',
            button: 'bg-white text-zinc-900 hover:bg-gray-100',
            accent: 'text-zinc-700'
        }
    };

    const t = themes[theme];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-[350px_1fr] gap-6">
                {/* Banner Side */}
                <div className={`${t.bg} rounded-[2rem] p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden h-[400px] lg:h-auto shadow-xl`}>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/2 -translate-y-1/2">
                        <Star className="w-64 h-64 fill-current" />
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full mb-6">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Top Rated</span>
                        </div>

                        <h2 className={`text-4xl md:text-5xl font-black ${t.text} mb-4 leading-tight`}>
                            {title}
                        </h2>
                        <p className={`text-lg font-bold ${t.subtext} mb-8 leading-relaxed`}>
                            {description}
                        </p>

                        <Link
                            href={viewAllLink}
                            className={`inline-flex items-center gap-2 px-8 py-4 ${t.button} rounded-full font-black text-sm uppercase tracking-wider transition-all transform hover:-translate-y-1 shadow-lg`}
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Bottom Decorative */}
                    <div className="relative z-10 mt-auto pt-12">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/10" />
                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/10" />
                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/10 flex items-center justify-center text-xs font-bold font-mono">+120</div>
                        </div>
                        <p className="text-xs font-bold opacity-60 mt-2 uppercase tracking-wide">Rated 5 Stars</p>
                    </div>
                </div>

                {/* Grid Side */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {products.slice(0, 6).map((product, idx) => (
                        <div key={product.id} className={idx >= 4 ? 'hidden lg:block' : ''}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
