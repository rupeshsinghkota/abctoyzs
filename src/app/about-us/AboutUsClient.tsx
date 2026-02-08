"use client";

import React from "react";
import Link from "next/link";
import { Star, ShieldCheck, Heart, Users, ShoppingBag, Trophy, MapPin, Sparkles, Zap } from "lucide-react";

export default function AboutUsClient() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16 font-sans">
            {/* Hero Section */}
            <div className="bg-white border-b border-zinc-100 overflow-hidden">
                <div className="container max-w-6xl mx-auto px-6 py-20 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest">
                                <Sparkles className="w-4 h-4" />
                                A Brand of D2BCart
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-zinc-900 leading-[0.9] tracking-tighter">
                                Crafting Dreams on <br />
                                <span className="text-primary">Four Wheels.</span>
                            </h1>
                            <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-xl">
                                Welcome to <strong>ABC Toyz</strong>, India's most trusted destination for premium children's ride-on vehicles. As a proud initiative of <strong>D2BCart</strong>, we bridge the gap between world-class engineering and childhood wonder.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/category/all" className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all">
                                    Browse Collection
                                </Link>
                                <Link href="/contact-us" className="bg-white border border-zinc-200 text-zinc-900 px-8 py-4 rounded-xl font-bold hover:bg-zinc-50 transition-all">
                                    Visit Showroom
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-[3rem] bg-zinc-100 overflow-hidden relative shadow-2xl shadow-zinc-200 group">
                                <img
                                    src="/logo_wide.png"
                                    alt="ABC Toyz x D2BCart"
                                    className="w-full h-full object-contain p-16 brightness-0 opacity-10 group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 flex items-center justify-center p-12">
                                    <div className="text-center">
                                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2">Our Legacy</p>
                                        <p className="text-4xl font-black text-zinc-900 tracking-tighter italic underline decoration-primary lg:text-5xl underline-offset-8">Precision & Play</p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating badges */}
                            <div className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-zinc-50 flex items-center gap-4 hidden md:flex">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-zinc-900">Swift Dispatch</p>
                                    <p className="text-xs text-zinc-500">24-48 Hour Process</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Story */}
            <div className="container max-w-6xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative order-2 lg:order-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=400" className="rounded-3xl shadow-lg" alt="Quality check" />
                                <img src="https://images.unsplash.com/photo-1556012018-501537ad10c0?auto=format&fit=crop&q=80&w=400" className="rounded-3xl shadow-lg" alt="Happy customer" />
                            </div>
                            <div className="space-y-4">
                                <img src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&q=80&w=400" className="rounded-3xl shadow-lg" alt="Toy car" />
                                <div className="bg-primary p-8 rounded-3xl text-white">
                                    <p className="text-4xl font-black mb-2">10k+</p>
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">Deliveries Pan-India</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6 order-1 lg:order-2">
                        <h2 className="text-4xl font-black text-zinc-900 tracking-tight">The D2BCart Vision</h2>
                        <div className="w-20 h-1.5 bg-primary rounded-full" />
                        <p className="text-zinc-600 leading-relaxed text-lg">
                            Founded in New Delhi with a singular focus on transforming how parents shop for ride-ons, <strong>ABC Toyz (by D2BCart)</strong> has grown from a local showroom to India's premier digital storefront for electric vehicles for kids.
                        </p>
                        <p className="text-zinc-600 leading-relaxed">
                            We understand that a ride-on is often a child's first "big" gift. That's why every product in our collection—from licensed Mercedes-Benz supercars to rugged Jeep Wranglers—is hand-vetted by our technical team at our headquarters in the Jhandewalan Toy Market.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {[
                                { title: "Safety First", desc: "Every model is ISI certified and safety-tested." },
                                { title: "Expert Support", desc: "Dedicated technicians available for after-sales assembly." },
                                { title: "True-to-Life Details", desc: "Working lights, music, and realistic engine sounds." }
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">{item.title}</p>
                                        <p className="text-sm text-zinc-500">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="bg-zinc-900 py-32 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
                <div className="container max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-4xl font-black text-white tracking-tight mb-4">Why Parents Choose Us</h2>
                    <p className="text-zinc-400 mb-20 max-w-2xl mx-auto">The D2BCart promise: Quality you can feel, safety you can trust.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={<ShieldCheck className="w-8 h-8" />}
                            title="Engineered Safety"
                            description="From slow-start technology to parental remote overrides, we prioritize your child's well-being above all else."
                        />
                        <ValueCard
                            icon={<Heart className="w-8 h-8" />}
                            title="Premium After-Sales"
                            description="Our relationship doesn't end at delivery. We provide spare parts, battery replacements, and technical guidance."
                        />
                        <ValueCard
                            icon={<MapPin className="w-8 h-8" />}
                            title="Pan-India Reach"
                            description="Operating from the heart of New Delhi, we use premium logistics to deliver smiles to every zip code in India."
                        />
                    </div>
                </div>
            </div>

            {/* Visit Us CTA */}
            <div className="container max-w-4xl mx-auto px-6 py-32 text-center">
                <div className="space-y-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto">
                        <Trophy className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">Experience it in Person</h2>
                    <p className="text-zinc-500 text-lg leading-relaxed italic">
                        "Visit our flagship showroom at Jhandewalan Toy Market, New Delhi to see our full range of 100+ models in action."
                    </p>
                    <div className="pt-8">
                        <Link href="/contact-us" className="inline-flex items-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-zinc-200">
                            Contact Our Concierge
                        </Link>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium pt-8">
                        &copy; 2026 D2BCart - Empowering Play, One Ride at a Time.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-zinc-700/50 text-left hover:bg-zinc-800 transition-all group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">{description}</p>
        </div>
    );
}
