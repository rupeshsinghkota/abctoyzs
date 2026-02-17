'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Car, Bike, Truck, Zap } from 'lucide-react'; // Fallback icons

// We'll simulate "Stories" with categories
// Quick Category Nav (Story Style)
const categories = [
    { id: 'new', name: 'New In', image: '/hero/hero_car_1769365166894.png', color: 'from-pink-500 via-red-500 to-yellow-500', link: '/category/new' },

    // Age Categories
    { id: 'toddlers', name: 'Toddlers', image: '/categories/age_toddler.png', color: 'from-pink-400 to-rose-500', link: '/category/age/1-3' },
    { id: 'kids', name: 'Kids', image: '/categories/age_kid.png', color: 'from-blue-400 to-cyan-500', link: '/category/age/3-6' },
    { id: 'teens', name: 'Teens', image: '/categories/age_teen.png', color: 'from-amber-400 to-orange-500', link: '/category/age/6-10' },

    // Power Categories
    { id: '12v', name: '12V Power', image: '/categories/power_12v.png', color: 'from-yellow-400 to-orange-500', link: '/category/power/12v' },
    { id: '24v', name: '24V Power', image: '/categories/power_24v.png', color: 'from-green-400 to-emerald-500', link: '/category/power/24v' },
    { id: '36v', name: '36V Power', image: '/categories/power_36v.png', color: 'from-indigo-400 to-purple-600', link: '/category/power/36v' },

    // Vehicle Types
    { id: 'supercars', name: 'Supercars', image: '/categories/cat_supercar_1769364520277.png', color: 'from-red-500 to-rose-600', link: '/category/cars' },
    { id: 'suvs', name: 'SUVs', image: '/categories/cat_suv_1769364537319.png', color: 'from-blue-500 to-indigo-600', link: '/category/jeeps' },
    { id: 'bikes', name: 'Bikes', image: '/categories/cat_motorcycle_1769364560643.png', color: 'from-slate-500 to-gray-600', link: '/category/bikes' },
    { id: 'dirtbikes', name: 'Dirt Bikes', image: '/categories/cat_dirtbike.png', color: 'from-orange-500 to-red-600', link: '/category/dirtbikes' },
    { id: 'atvs', name: 'ATVs', image: '/categories/cat_atv_1769364577413.png', color: 'from-green-500 to-emerald-600', link: '/category/atvs' },
    { id: 'utvs', name: 'UTVs', image: '/categories/cat_utv_1769364600471.png', color: 'from-orange-500 to-red-600', link: '/category/utvs' },
    { id: 'gokarts', name: 'Go-Karts', image: '/categories/cat_gokart_1769364617852.png', color: 'from-yellow-500 to-amber-600', link: '/category/gokarts' },
    { id: 'scooters', name: 'Scooters', image: '/categories/cat_scooter_1769364639228.png', color: 'from-cyan-500 to-blue-600', link: '/category/scooters' },

];

export function Stories() {
    return (
        <section className="py-6 bg-background border-b border-border/40">
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar md:justify-center">
                {categories.map((cat) => (
                    <Link key={cat.id} href={cat.link} className="flex flex-col items-center gap-2 shrink-0 group">
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
