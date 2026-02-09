import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, User } from 'lucide-react';
import { VEHICLE_CATEGORIES, POWER_CATEGORIES, AGE_CATEGORIES } from '@/lib/data';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export const revalidate = 300; // Revalidate every 5 minutes

export default function CategoryPage() {
    return (
        <div className="min-h-screen pb-24 md:pb-20 bg-background">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 pt-2">
                <Breadcrumb items={[{ label: 'Categories' }]} />
            </div>

            <div className="container mx-auto px-4 py-8 pb-24 space-y-12">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight flex items-center gap-3">
                        All Categories <Sparkles className="w-8 h-8 text-primary" />
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">Browse our complete collection of premium ride-on toys.</p>
                </div>

                {/* 1. Vehicle Types (Image Grid) */}
                <section>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 lg:gap-6 auto-rows-[120px] md:auto-rows-[240px]">
                        {VEHICLE_CATEGORIES.map((cat) => (
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
                </section>

                {/* 2. Shop by Power */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-xl font-bold font-heading">Shop by Power</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { ...POWER_CATEGORIES[0], img: '/categories/power_12v.png' },
                            { ...POWER_CATEGORIES[1], img: '/categories/power_24v.png' },
                            { ...POWER_CATEGORIES[2], img: '/categories/power_36v.png' }
                        ].map((power) => (
                            <Link
                                key={power.value}
                                href={`/category/power/${power.value}`}
                                className="group relative rounded-xl overflow-hidden aspect-[4/3] md:aspect-video shadow-sm hover:shadow-md transition-all"
                            >
                                <img src={power.img} alt={power.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                    <div className="text-xs font-bold bg-yellow-500 text-black px-1.5 py-0.5 rounded inline-block mb-1">
                                        {power.label.split(' ')[0]}
                                    </div>
                                    <p className="text-[10px] md:text-xs text-white/80 line-clamp-1">{power.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 3. Shop by Age */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold font-heading">Shop by Age</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { ...AGE_CATEGORIES[0], img: '/categories/age_toddler.png' },
                            { ...AGE_CATEGORIES[1], img: '/categories/age_kid.png' },
                            { ...AGE_CATEGORIES[2], img: '/categories/age_teen.png' }
                        ].map((age) => (
                            <Link
                                key={age.value}
                                href={`/category/age/${age.value}`}
                                className="group relative rounded-xl overflow-hidden aspect-square shadow-sm hover:shadow-md transition-all"
                            >
                                <img src={age.img} alt={age.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/30 backdrop-blur-[1px]">
                                    <span className="text-2xl md:text-3xl font-black drop-shadow-md">
                                        {age.label.match(/\((.*?)\)/)?.[1] || age.value}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        Years
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
