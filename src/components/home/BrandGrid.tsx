'use client';
import { Car, Award, ShieldCheck, Zap } from 'lucide-react';

const brands = [
    { name: "Mercedes-Benz", icon: Car },
    { name: "Jeep", icon: ShieldCheck },
    { name: "BMW", icon: Zap },
    { name: "Audi", icon: Award },
    { name: "Land Rover", icon: Car },
    { name: "Lamborghini", icon: Zap },
    { name: "Ford", icon: ShieldCheck },
    { name: "Toyota", icon: Car },
];

export function BrandGrid() {
    return (
        <section className="py-12 border-y border-zinc-100 bg-white">
            <div className="container mx-auto px-4">
                <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest mb-10">Official Licensed Partners</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {brands.map((brand, i) => (
                        <div key={i} className="flex items-center justify-center gap-3 py-6 px-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-900/10 hover:shadow-sm transition-all duration-300 group cursor-default">
                            {/* Icons are placeholders for logos */}
                            <span className="font-black text-zinc-300 group-hover:text-black text-lg md:text-xl transition-colors uppercase tracking-tight">{brand.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
