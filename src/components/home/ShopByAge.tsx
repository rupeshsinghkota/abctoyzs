'use client';
import Link from 'next/link';

const ageGroups = [
    { label: "1-3 Years", range: "Toddlers", href: "/category/age/1-3" },
    { label: "3-5 Years", range: "Preschoolers", href: "/category/age/3-5" },
    { label: "5-8 Years", range: "Kids", href: "/category/age/5-8" },
    { label: "8+ Years", range: "Big Kids", href: "/category/age/8-plus" }
];

export function ShopByAge() {
    return (
        <section className="py-6 px-4 container mx-auto">
            <h2 className="text-xl md:text-2xl font-black mb-6">Shop By Age</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ageGroups.map((group, i) => (
                    <Link key={i} href={group.href} className="group relative aspect-square bg-zinc-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 block">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <span className="text-4xl font-black text-black/5 absolute top-4 right-4 group-hover:text-black/10 transition-colors">{i + 1}</span>
                            <h3 className="text-lg md:text-xl font-bold relative z-10">{group.label}</h3>
                            <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-wider relative z-10">{group.range}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
