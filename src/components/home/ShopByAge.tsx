'use client';
import Link from 'next/link';
import Image from 'next/image';

const ageGroups = [
    { label: "1-3 Years", range: "Toddlers", href: "/category/age/1-3", image: "/images/shop-by/age-toddler.png" },
    { label: "3-6 Years", range: "Preschoolers", href: "/category/age/3-6", image: "/images/shop-by/age-preschool.png" },
    { label: "6-10 Years", range: "Kids", href: "/category/age/6-10", image: "/images/shop-by/age-kids.png" },
    { label: "10+ Years", range: "Teens", href: "/category/age/10+", image: "/images/shop-by/age-bigkids.png" }
];

export function ShopByAge() {
    return (
        <section className="py-6 px-4 container mx-auto">
            <h2 className="text-xl md:text-2xl font-black mb-6 text-center">Shop By Age</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ageGroups.map((group, i) => (
                    <Link key={i} href={group.href} className="group relative aspect-square bg-zinc-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 block">
                        <Image
                            src={group.image}
                            alt={group.label}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                            <span className="text-4xl font-black text-white/10 absolute top-4 right-4">{i + 1}</span>
                            <h3 className="text-lg md:text-xl font-bold text-white relative z-10">{group.label}</h3>
                            <p className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-wider relative z-10">{group.range}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
