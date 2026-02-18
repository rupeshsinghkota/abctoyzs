'use client';
import { Product } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export function FeatureSpotlight({ product, reversed = false }: { product: Product | null, reversed?: boolean }) {
    if (!product) return null;

    // Sanitize description: Prefer meta_description, fallback to stripping HTML tags
    const description = product.meta_description ||
        (product.description ? product.description.replace(/<[^>]+>/g, '').substring(0, 150) + '...' :
            "Experience the ultimate ride with premium features, safety, and performance.");

    return (
        <section className="py-2 md:py-4 px-4">
            <div className="container mx-auto">
                <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-16 bg-black rounded-[2.5rem] overflow-hidden p-6 md:p-12 relative shadow-2xl shadow-zinc-900/10`}>

                    {/* Background Glow */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[150px] rounded-full mix-blend-screen" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 blur-[150px] rounded-full mix-blend-screen" />
                    </div>

                    {/* Image Side */}
                    <div className="flex-1 w-full relative z-10 group">
                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="flex-1 space-y-6 text-center lg:text-left relative z-10 flex flex-col items-center lg:items-start">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>Editor's Pick</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
                            {product.name}
                        </h2>

                        <p className="text-base md:text-lg text-gray-300 max-w-xl leading-relaxed font-medium">
                            {description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <Link href={`/product/${product.slug}`} className="px-8 py-3.5 bg-white text-black rounded-full font-black text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors flex items-center gap-2 transform hover:-translate-y-1 duration-200">
                                Shop Now <ArrowRight className="w-4 h-4" />
                            </Link>
                            <div className="text-white font-black text-2xl tracking-tight">
                                ₹{product.price.toLocaleString()}
                            </div>
                        </div>

                        {/* Specs Mini-Grid */}
                        <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/10 w-full mt-2">
                            <div className="text-center lg:text-left">
                                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Battery</span>
                                <span className="block text-white font-bold text-sm bg-white/5 rounded-lg px-2 py-1 inline-block border border-white/5">{product.specs?.battery || 'Standard'}</span>
                            </div>
                            <div className="text-center lg:text-left">
                                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Speed</span>
                                <span className="block text-white font-bold text-sm bg-white/5 rounded-lg px-2 py-1 inline-block border border-white/5">{product.specs?.speed || 'Standard'}</span>
                            </div>
                            <div className="text-center lg:text-left">
                                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Age</span>
                                <span className="block text-white font-bold text-sm bg-white/5 rounded-lg px-2 py-1 inline-block border border-white/5">{product.ageGroup || '3-8 Years'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
