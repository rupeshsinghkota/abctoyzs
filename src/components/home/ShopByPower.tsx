'use client';
import Link from 'next/link';
import { Zap, Gauge, Mountain } from 'lucide-react';

const powerTypes = [
    { label: "12V Standard", desc: "Safe speeds for beginners", icon: Zap, href: "/category/power/12v", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
    { label: "24V Performance", desc: "Faster drift & speed", icon: Gauge, href: "/category/power/24v", color: "bg-orange-50 text-orange-600 hover:bg-orange-100" },
    { label: "4x4 Off-Road", desc: "All-terrain domination", icon: Mountain, href: "/category/power/4x4", color: "bg-green-50 text-green-600 hover:bg-green-100" }
];

export function ShopByPower() {
    return (
        <section className="py-6 px-4 container mx-auto">
            <h2 className="text-xl md:text-2xl font-black mb-6">Shop By Power</h2>
            <div className="grid md:grid-cols-3 gap-4">
                {powerTypes.map((type, i) => (
                    <Link key={i} href={type.href} className={`flex flex-col justify-between p-8 rounded-[2rem] border border-transparent transition-all duration-300 group ${type.color}`}>
                        <type.icon className="w-10 h-10 mb-8 transform group-hover:scale-110 transition-transform" />
                        <div>
                            <h3 className="text-2xl font-black mb-1 text-black/90">{type.label}</h3>
                            <p className="font-bold opacity-70 text-sm text-black/60">{type.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
