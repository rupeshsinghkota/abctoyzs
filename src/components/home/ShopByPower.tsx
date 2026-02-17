'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Gauge, Mountain } from 'lucide-react';

const powerTypes = [
    { label: "12V Standard", desc: "Safe speeds for beginners", icon: Zap, href: "/category/power/12v", color: "bg-blue-50 text-blue-600 hover:bg-blue-100", image: "/images/shop-by/power-12v.png" },
    { label: "24V Performance", desc: "Faster drift & speed", icon: Gauge, href: "/category/power/24v", color: "bg-orange-50 text-orange-600 hover:bg-orange-100", image: "/images/shop-by/power-24v.png" },
    { label: "36V/48V Pro", desc: "All-terrain domination", icon: Mountain, href: "/category/power/36v", color: "bg-green-50 text-green-600 hover:bg-green-100", image: "/images/shop-by/power-4x4.png" }
];

export function ShopByPower() {
    return (
        <section className="py-6 px-4 container mx-auto">
            <h2 className="text-xl md:text-2xl font-black mb-6 text-center">Shop By Power</h2>
            <div className="grid md:grid-cols-3 gap-4">
                {powerTypes.map((type, i) => (
                    <Link key={i} href={type.href} className={`flex flex-col justify-between p-6 md:p-8 rounded-[2rem] border border-transparent transition-all duration-300 group ${type.color} overflow-hidden relative`}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 opacity-80 group-hover:scale-110 transition-transform duration-500">
                            <Image src={type.image} alt={type.label} fill className="object-contain" />
                        </div>
                        <type.icon className="w-8 h-8 md:w-10 md:h-10 mb-4 md:mb-8 relative z-10" />
                        <div className="relative z-10">
                            <h3 className="text-xl md:text-2xl font-black mb-1 text-black/90">{type.label}</h3>
                            <p className="font-bold opacity-70 text-xs md:text-sm text-black/60">{type.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
