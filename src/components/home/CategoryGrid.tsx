import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VEHICLE_CATEGORIES } from '@/lib/data';

export function CategoryGrid() {
    return (
        <div className="py-12 container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black font-heading tracking-tight flex items-center gap-2">
                        Shop by Category <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </h2>
                    <p className="text-muted-foreground mt-1">Explore our premium collection</p>
                </div>
                <Link href="/category" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                    View All <ArrowRight className="w-5 h-5 bg-primary text-white rounded-full p-1" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 auto-rows-[160px] md:auto-rows-[240px]">
                {VEHICLE_CATEGORIES.map((cat, i) => (
                    <Link
                        key={cat.value}
                        href={`/category/${cat.value}`}
                        className="group relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        {/* Image */}
                        <img
                            src={cat.image}
                            alt={cat.label}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                        {/* Content */}
                        <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                            <h3 className="text-white font-black uppercase tracking-wider transform transition-transform duration-300 group-hover:-translate-y-2 leading-tight text-sm md:text-xl lg:text-2xl">
                                {cat.label}
                            </h3>
                            <div className="hidden md:flex items-center gap-2 text-primary font-bold opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 mt-2">
                                <span>Explore</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <Link href="/category" className="mt-6 md:hidden w-full flex items-center justify-center gap-2 px-6 py-4 bg-secondary/50 rounded-xl font-bold">
                View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

