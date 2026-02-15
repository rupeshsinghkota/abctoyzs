"use client";

import React from "react";
import Link from "next/link";
import {
    Star, ShieldCheck, Heart, Users, ShoppingBag, Trophy,
    MapPin, Sparkles, Zap, CheckCircle2, History, Scale,
    Wrench, ShieldAlert, Award, Globe, Building2
} from "lucide-react";

export default function AboutUsClient() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16 font-sans">
            {/* Hero Section */}
            <div className="bg-white border-b border-zinc-100 overflow-hidden">
                <div className="container max-w-6xl mx-auto px-6 py-20 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest">
                                <Sparkles className="w-4 h-4" />
                                Premium Electric Ride-ons
                            </div>
                            <h1 className="text-5xl lg:text-8xl font-black text-zinc-900 leading-[0.85] tracking-tighter">
                                Excellence in <br />
                                <span className="text-primary italic">Every Mile.</span>
                            </h1>
                            <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-xl">
                                Welcome to <strong>ABC Toyz</strong>, India's most trusted destination for premium children's ride-on vehicles. We bridge the gap between world-class engineering and pure childhood wonder.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/category/all" className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
                                    Explore the Fleet
                                </Link>
                                <Link href="/contact-us" className="bg-white border border-zinc-200 text-zinc-900 px-8 py-4 rounded-xl font-bold hover:bg-zinc-50 transition-all">
                                    Visit Our Showroom
                                </Link>
                            </div>
                        </div>
                        <div className="relative animate-in fade-in zoom-in-95 duration-1000">
                            <div className="aspect-square rounded-[4rem] bg-zinc-100 overflow-hidden relative shadow-2xl shadow-zinc-200 group">
                                <img
                                    src="/logo_wide.png"
                                    alt="ABC Toyz"
                                    className="w-full h-full object-contain p-24 brightness-0 opacity-10 group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 flex items-center justify-center p-12">
                                    <div className="text-center">
                                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2">Since 2024</p>
                                        <p className="text-5xl font-black text-zinc-900 tracking-tighter lg:text-6xl">Parent Approved.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Stats */}
                            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-zinc-50 flex items-center gap-6 hidden md:flex">
                                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-zinc-900">100%</p>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">ISI Certified</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The ABC Toyz Philosophy Section */}
            <div className="container max-w-6xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">The ABC Toyz Philosophy</h2>
                            <div className="w-24 h-2 bg-primary rounded-full" />
                        </div>
                        <div className="space-y-6 text-zinc-600 leading-relaxed text-lg">
                            <p>
                                <strong>ABC Toyz</strong> was born as our answer to this challenge. We specialize in curating safety-certified, high-performance electric cars, bikes, and SUVs that don't just mimic real vehicles—they emulate their soul.
                            </p>
                            <p className="bg-zinc-100 p-6 rounded-2xl border-l-4 border-primary italic">
                                "Our mission is to turn every driveway into a racetrack and every child into an explorer, all while ensuring peace of mind for parents through rigorous quality standards."
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-50 border-b-4 border-b-primary">
                                <p className="text-4xl font-black text-zinc-900 mb-2">500+</p>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Models</p>
                            </div>
                            <div className="bg-zinc-900 p-8 rounded-[2rem] text-white">
                                <p className="text-4xl font-black mb-2">10k+</p>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Families Happy</p>
                            </div>
                        </div>
                        <div className="space-y-6 pt-12">
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-50">
                                <p className="text-4xl font-black text-zinc-900 mb-2">24h</p>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Dispatch Goal</p>
                            </div>
                            <div className="bg-primary p-8 rounded-[2rem] text-white">
                                <p className="text-4xl font-black mb-2">100%</p>
                                <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Safety Focus</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The 5-Step Quality Banner */}
            <div className="bg-zinc-900 py-32 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                <div className="container max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-6">The Gold Standard Process</h2>
                        <p className="text-zinc-500 text-lg max-w-2xl mx-auto italic">How we ensure every ABC Toyz vehicle is showroom-ready.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        <ProcessStep
                            number="01"
                            icon={<Building2 className="w-6 h-6" />}
                            title="Direct Sourcing"
                            desc="We source directly from manufacturers of world-renowned licensed vehicles."
                        />
                        <ProcessStep
                            number="02"
                            icon={<Scale className="w-6 h-6" />}
                            title="ISI Compliance"
                            desc="Every batch undergoes Bureau of Indian Standards (ISI) certification protocols."
                        />
                        <ProcessStep
                            number="03"
                            icon={<Wrench className="w-6 h-6" />}
                            title="Pre-Sync Check"
                            desc="Engineers test remote sync, music consoles, and battery voltage before packing."
                        />
                        <ProcessStep
                            number="04"
                            icon={<ShieldAlert className="w-6 h-6" />}
                            title="Shock Testing"
                            desc="We use heavy-duty corrugated 5-ply cartons for zero-damage shipping."
                        />
                        <ProcessStep
                            number="05"
                            icon={<CheckCircle2 className="w-6 h-6" />}
                            title="Final Polish"
                            desc="Dusting and final detail check before the courier pickup."
                        />
                    </div>
                </div>
            </div>

            {/* Our Journey Section */}
            <div className="container max-w-5xl mx-auto px-6 py-32">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Our Journey</h2>
                    <p className="text-zinc-500 mt-4 font-medium uppercase tracking-widest text-xs">Milestones of Excellence</p>
                </div>

                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-300 before:to-transparent">
                    <TimelineItem
                        year="2024"
                        title="The Founding"
                        desc="ABC Toyz launches in New Delhi with its flagship showroom at Jhandewalan Toy Market."
                        align="left"
                    />
                    <TimelineItem
                        year="2024"
                        title="Digital Expansion"
                        desc="ABC Toyz (abctoyz.in) goes live, bringing premium ride-ons to families across India."
                        align="right"
                    />
                    <TimelineItem
                        year="2025"
                        title="10,000 Deliveries"
                        desc="A major milestone reached, serving customers from Srinagar to Kanyakumari."
                        align="left"
                    />
                </div>
            </div>

            {/* Core Values Redux */}
            <div className="bg-zinc-100 py-32">
                <div className="container max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tight mb-20">Why Trust ABC Toyz?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={<ShoppingBag className="w-8 h-8 text-primary" />}
                            title="Curated Collections"
                            desc="We don't sell everything; we only sell the best. Every model is selected for durability and style."
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8 text-primary" />}
                            title="Pan-India Logistics"
                            desc="Partnerships with BlueDart and Delhivery ensure safe and predictable transit times."
                        />
                        <FeatureCard
                            icon={<Award className="w-8 h-8 text-primary" />}
                            title="Genuine Spare Parts"
                            desc="We keep batteries, chargers, and motors in stock so your toy stays in motion for years."
                        />
                    </div>
                </div>
            </div>

            {/* Business Credentials (For Compliance & Trust) */}
            <div className="container max-w-4xl mx-auto px-6 py-32">
                <div className="bg-white rounded-[3rem] p-12 border border-zinc-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Building2 className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-zinc-900 mb-8 border-b border-zinc-50 pb-6">Business Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Legal Trading Name</p>
                                    <p className="font-bold text-zinc-900 text-lg">ABC Toyz</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Brand Identity</p>
                                    <p className="font-bold text-zinc-900 text-lg">ABC Toyz</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Proprietor</p>
                                    <p className="font-bold text-zinc-900 text-lg">Chandan Kumar</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Headquarters</p>
                                    <p className="font-bold text-zinc-900 text-lg">Jhandewalan Toy Market, New Delhi</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Core Mission</p>
                                    <p className="text-zinc-600 font-medium">Empowering Play Through Engineering</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visit Us CTA */}
            <div className="container max-w-4xl mx-auto px-6 py-32 text-center">
                <div className="space-y-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto hover:rotate-12 transition-transform">
                        <Trophy className="w-12 h-12" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter">Your First Car Awaits.</h2>
                    <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                        Experience our full range of 200+ electric cars and motorcycles at our flagship showroom in New Delhi.
                    </p>
                    <div className="pt-8 space-x-4">
                        <Link href="/contact-us" className="inline-flex items-center gap-3 bg-zinc-900 text-white px-10 py-6 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-zinc-300">
                            Contact Our Concierge
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProcessStep({ number, icon, title, desc }: { number: string; icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="space-y-6 group">
            <div className="flex items-center gap-4">
                <span className="text-primary font-black text-2xl opacity-20 group-hover:opacity-100 transition-opacity">{number}</span>
                <div className="h-px bg-zinc-800 flex-grow" />
            </div>
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-primary mb-2">
                {icon}
            </div>
            <h3 className="text-white font-bold text-lg tracking-tight">{title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function TimelineItem({ year, title, desc, align }: { year: string; title: string; desc: string; align: "right" | "left" }) {
    return (
        <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-900 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <History className="w-5 h-5 opacity-40" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-black text-zinc-900 text-xl">{title}</div>
                    <time className="font-mono font-bold text-primary">{year}</time>
                </div>
                <div className="text-zinc-500 text-sm">{desc}</div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="p-10 bg-white rounded-[2.5rem] border border-zinc-200 hover:shadow-xl hover:shadow-zinc-200/50 transition-all text-left">
            <div className="mb-6">{icon}</div>
            <h3 className="text-xl font-bold text-zinc-900 mb-4">{title}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm font-medium">{desc}</p>
        </div>
    );
}
