"use client";

import React from "react";
import Link from "next/link";
import { Star, ShieldCheck, Heart, Users, ShoppingBag, Trophy } from "lucide-react";

export default function AboutUsClient() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16 font-sans">
            {/* Hero Section */}
            <div className="bg-white border-b border-zinc-100 overflow-hidden">
                <div className="container max-w-6xl mx-auto px-6 py-20 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest">
                                <Trophy className="w-4 h-4" />
                                India's Premium Ride-On Toy Store
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-zinc-900 leading-[0.9] tracking-tighter">
                                Fueling the <br />
                                <span className="text-primary">Next Generation</span>
                                <br /> of Adventures.
                            </h1>
                            <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-xl">
                                At ABC Toyz, we're not just selling toys; we're creating memories. We bring the thrill of premium, safety-certified ride-on cars and bikes to your doorstep.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-[3rem] bg-zinc-100 overflow-hidden relative shadow-2xl shadow-zinc-200">
                                <img
                                    src="/logo_wide.png"
                                    alt="ABC Toyz Hero"
                                    className="w-full h-full object-contain p-20 brightness-0 opacity-10"
                                />
                                <div className="absolute inset-0 flex items-center justify-center p-12">
                                    <div className="text-center">
                                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-4">Established</p>
                                        <p className="text-8xl font-black text-zinc-900 tracking-tighter">2024</p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating badges */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-zinc-50 flex items-center gap-4 animate-bounce duration-[3000ms]">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-zinc-900">Safety First</p>
                                    <p className="text-xs text-zinc-500">ISI Certified Quality</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container max-w-6xl mx-auto px-6 -mt-10 mb-24">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard count="500+" label="Premium Models" />
                    <StatCard count="10k+" label="Happy Kids" />
                    <StatCard count="24/7" label="Support" />
                    <StatCard count="100%" label="Original Products" />
                </div>
            </div>

            {/* Our Values */}
            <div className="container max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-4">What Makes Us Different?</h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto">We meticulousy curate the world's best ride-ons, from mini Supercars to rugged ATVs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <ValueCard
                        icon={<Heart className="w-8 h-8" />}
                        title="Curated with Love"
                        description="Every car and bike is hand-picked for style, performance, and most importantly, safety."
                    />
                    <ValueCard
                        icon={<ShieldCheck className="w-8 h-8" />}
                        title="Safety Certified"
                        description="We only deal in products that pass rigorous safety standards because your child deserves the best."
                    />
                    <ValueCard
                        icon={<ShoppingBag className="w-8 h-8" />}
                        title="Pan-India Delivery"
                        description="From Srinagar to Kanyakumari, we deliver our toys securely to every corner of India."
                    />
                </div>
            </div>

            {/* Join the Community */}
            <div className="container max-w-6xl mx-auto px-6 py-24">
                <div className="bg-zinc-900 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden text-center lg:text-left">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter mb-6">Ready to find their first dream car?</h2>
                            <p className="text-zinc-400 text-lg mb-8 max-w-lg">Explore our collections of electric Jeeps, motorcycles, and supercars today.</p>
                            <Link href="/category/all" className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20">
                                Shop All Ride-Ons
                            </Link>
                        </div>
                        <div className="hidden lg:flex items-center justify-end gap-6 text-white text-sm font-bold opacity-30 select-none">
                            <p className="vertical-text">QUALITY</p>
                            <p className="vertical-text">SPEED</p>
                            <p className="vertical-text">SAFETY</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ count, label }: { count: string; label: string }) {
    return (
        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 text-center">
            <p className="text-3xl font-black text-primary mb-1 tracking-tighter">{count}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
        </div>
    );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-8 space-y-4">
            <div className="w-16 h-16 bg-white shadow-lg rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">{description}</p>
        </div>
    );
}
