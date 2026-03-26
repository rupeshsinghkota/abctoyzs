"use client";

import Image from 'next/image';
import { Video, Calendar, Smartphone, Star, Play, CheckCircle2 } from "lucide-react";

export function VideoShowcaseSection() {
    return (
        <section className="py-20 bg-zinc-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/40 rounded-full blur-[120px]" />
            </div>

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Content */}
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">New Experience</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] tracking-tight">
                            SEE IT LIVE <br /> <span className="text-primary">BEFORE YOU BUY</span>
                        </h2>

                        <p className="text-zinc-400 text-base md:text-lg font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Stop guessing. Hop on a 15-minute private video call with our showroom experts.
                            Watch us drive, test, and explain every feature of your favorite ride-on.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                            {[
                                "Real-time walkthrough",
                                "Completely Free",
                                "Ask safety questions",
                                "See actual colors"
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 justify-center lg:justify-start">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    <span className="text-zinc-300 font-bold text-sm tracking-tight">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                            <a
                                href="/category/all"
                                className="px-8 py-4 bg-primary text-white font-black text-sm rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-primary/30 active:scale-95 flex items-center gap-2 uppercase tracking-wider"
                            >
                                <Play className="w-4 h-4 fill-current" /> Browse & Book Slot
                            </a>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-[140px]">
                                Available: <br /> 9:00 AM - 7:00 PM
                            </p>
                        </div>
                    </div>

                    {/* Right Mockup/Graphic */}
                    <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                        <div className="relative aspect-square md:aspect-[4/5] bg-zinc-900 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl group">
                            {/* Mock video background */}
                            <Image
                                src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=2070&auto=format&fit=crop"
                                alt="Toy Car Showcase"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                            />

                            {/* Overlay UI elements */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg flex items-center gap-2 border border-white/10">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE • SHOWROOM</span>
                                        </div>
                                        <p className="text-white font-bold text-xs mt-1 drop-shadow-lg">Thar 4x4 Luxury Edition</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                                                <Smartphone className="w-4 h-4 opacity-70" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 group-hover:translate-y-[-5px] transition-transform shadow-2xl">
                                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                            <Star className="w-6 h-6 fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-black text-sm tracking-tight italic">"This turned out exactly as shown. My son loves it!"</p>
                                            <p className="text-primary text-[10px] font-black uppercase mt-1">— Ananya K., New Delhi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40">
                                        <Play className="w-6 h-6 fill-current ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements for depth */}
                        <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-2xl border border-zinc-100 hidden md:flex items-center gap-4 animate-bounce [animation-duration:4s]">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-primary">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase leading-none mb-1">Booked Today</p>
                                <p className="text-zinc-900 font-extrabold text-sm tracking-tight leading-none">12 Families</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
