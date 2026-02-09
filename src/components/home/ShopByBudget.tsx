'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const budgets = [
    { label: "Budget Friendly", range: "Under ₹10,000", href: "/category/price/under-10k", bg: "bg-white border-zinc-200", image: "/images/shop-by/power-12v.png" },
    { label: "Best Sellers", range: "₹10,000 - ₹20,000", href: "/category/price/10k-20k", bg: "bg-zinc-900 text-white border-zinc-900", image: "/images/shop-by/power-24v.png" },
    { label: "Premium Luxury", range: "Above ₹20,000", href: "/category/price/above-20k", bg: "bg-amber-100 border-amber-200 text-amber-900", image: "/images/shop-by/power-4x4.png" }
];

export function ShopByBudget() {
    return (
        <section className="py-6 px-4 container mx-auto">
            <h2 className="text-xl md:text-2xl font-black mb-6">Shop By Budget</h2>
            <div className="grid md:grid-cols-3 gap-4">
                {budgets.map((b, i) => (
                    <Link key={i} href={b.href} className={`p-6 md:p-8 rounded-3xl border ${b.bg} flex flex-col justify-center items-center text-center gap-2 group hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden shadow-sm hover:shadow-lg duration-300`}>
                        <div className="relative w-full h-24 md:h-32 mb-2 group-hover:scale-110 transition-transform duration-500">
                            <Image src={b.image} alt={b.label} fill className="object-contain" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold relative z-10">{b.label}</h3>
                        <p className="opacity-80 font-mono text-xs md:text-sm relative z-10">{b.range}</p>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1 group-hover:translate-x-0 duration-300">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
