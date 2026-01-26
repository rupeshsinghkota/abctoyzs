'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Car, Bike, Truck, Zap } from 'lucide-react'; // Fallback icons

// We'll simulate "Stories" with categories
// Quick Category Nav (Story Style)
const categories = [
    { id: 'new', name: 'New In', image: '/hero/hero_car_1769365166894.png', color: 'from-pink-500 via-red-500 to-yellow-500' }, // Use Hero Car for "New"
    { id: 'cars', name: 'Cars', image: '/categories/cat_supercar_1769364520277.png', color: 'from-blue-400 to-blue-600' },
    { id: 'jeeps', name: 'Jeeps', image: '/categories/cat_suv_1769364537319.png', color: 'from-orange-400 to-orange-600' },
    { id: 'bikes', name: 'Bikes', image: '/categories/cat_motorcycle_1769364560643.png', color: 'from-purple-400 to-purple-600' },
    { id: 'atvs', name: 'ATVs', image: '/categories/cat_atv_1769364577413.png', color: 'from-red-500 to-red-700' },
    { id: 'scooters', name: 'Scooters', image: '/categories/cat_scooter_1769364639228.png', color: 'from-teal-400 to-teal-600' },
    { id: 'parts', name: 'Parts', image: '/categories/cat_parts_1769364655385.png', color: 'from-gray-400 to-gray-600' },
];

export function Stories() {
    return (
        <section className="py-6 bg-background border-b border-border/40">
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar md:justify-center">
                {categories.map((cat) => (
                    <Link key={cat.id} href={`/category/${cat.id === 'new' ? 'new' : cat.id}`} className="flex flex-col items-center gap-2 shrink-0 group">
                        <div className={cn(
                            "w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr transition-transform group-active:scale-95 group-hover:scale-105",
                            cat.color
                        )}>
                            <div className="w-full h-full rounded-full bg-background border-[3px] border-background overflow-hidden relative">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <span className="text-xs font-bold text-foreground/90 tracking-tight">{cat.name}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
