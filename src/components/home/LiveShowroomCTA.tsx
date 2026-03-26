"use client";

import { Video, ArrowRight, Play, Smartphone } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function LiveShowroomCTA() {
    return (
        <section className="py-12 md:py-24 overflow-hidden">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="relative rounded-[2.5rem] md:rounded-[4rem] bg-zinc-950 p-8 md:p-16 lg:p-24 overflow-hidden border border-white/5 shadow-2xl">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 -tr-32 w-96 h-96 bg-primary/20 blur-[120px] rounded-full opacity-50" />
                    <div className="absolute bottom-0 left-0 -bl-32 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full opacity-30" />
                    
                    <div className="relative flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                        {/* Content */}
                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Now Live from Delhi
                            </motion.div>

                            <h2 className="text-4xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                                Don&apos;t just shop. <br />
                                <span className="text-primary italic">Experience it.</span>
                            </h2>

                            <p className="text-zinc-400 text-lg font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Join our 1-on-1 private video calls. See the build quality, test the remote, and get expert advice live from our showroom.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 pt-4">
                                <Link 
                                    href="/live-showroom"
                                    className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <Video className="w-5 h-5 animate-pulse" />
                                    Book Live Tour
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-zinc-950 overflow-hidden bg-zinc-800">
                                            <img src={`https://i.pravatar.cc/100?u=showroom${i}`} alt="Specialist" className="w-full h-full object-cover grayscale" />
                                        </div>
                                    ))}
                                    <div className="h-10 px-4 rounded-full border-4 border-zinc-950 bg-zinc-900 flex items-center justify-center text-[10px] font-black text-white/50">
                                        +Live Now
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Preview */}
                        <div className="lg:col-span-5 w-full">
                            <div className="relative group max-w-[320px] mx-auto lg:max-w-none">
                                {/* The "Phone" Container */}
                                <div className="relative aspect-[9/16] rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-zinc-900 rotate-3 group-hover:rotate-0 transition-transform duration-700">
                                    <img 
                                        src="/images/live-showroom/expert-guide.png" 
                                        alt="Live Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    
                                    {/* UI Overlays */}
                                    <div className="absolute top-6 left-6 px-3 py-1 bg-red-600 rounded-full text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        LIVE
                                    </div>

                                    <div className="absolute bottom-10 left-6 right-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                <Smartphone className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white text-[10px] font-black uppercase tracking-widest">Rahul is Live</p>
                                                <p className="text-zinc-500 text-[9px] font-bold">Delhi Showroom</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary/80 w-[65%]" />
                                            </div>
                                            <div className="flex-1 h-1 bg-white/20 rounded-full" />
                                        </div>
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-primary fill-primary" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Decorative Badges */}
                                <div className="absolute -right-8 top-12 bg-white rounded-2xl p-4 shadow-2xl border border-zinc-100 hidden md:block rotate-6">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Fee</p>
                                    <p className="text-lg font-black text-zinc-950 leading-none uppercase">Free <span className="text-[10px] text-primary">No Fee</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
