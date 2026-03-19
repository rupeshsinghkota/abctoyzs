"use client";

import { Video, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LiveTourPromo({ productName }: { productName: string }) {
    const benefits = [
        "See the actual size & build quality",
        "Test the remote control live",
        "Check all lighting & sound effects",
        "Get all your questions answered"
    ];

    return (
        <div className="group relative overflow-hidden rounded-[2rem] bg-zinc-900 p-8 md:p-10 shadow-2xl transition-all hover:shadow-primary/10">
            {/* Background Accent */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-orange-500/5 blur-[100px]" />

            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Exclusive Experience
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                        See it Live before <span className="text-primary italic">you buy.</span>
                    </h2>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                        Not sure about the size or features? Book a 5-minute private video tour and see the <strong>{productName}</strong> in action from our Delhi showroom.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 group/item">
                                <div className="h-5 w-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                                    <Check className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-zinc-300 text-[11px] font-bold">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                        <a
                            href={`https://wa.me/917557777998?text=${encodeURIComponent(`Hi ABC Toyz, I want to book a Video Tour for ${productName}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:shadow-2xl hover:shadow-primary/20 active:scale-95 group/btn"
                        >
                            <Video className="w-5 h-5 animate-pulse" />
                            Book Free Video Tour
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                        <div className="flex flex-col items-center sm:items-start">
                            <a 
                                href="/live-showroom" 
                                className="text-white font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors underline underline-offset-4"
                            > 
                                How it works?
                            </a>
                            <span className="text-zinc-500 text-[10px] font-bold">Google Meet Available</span>
                        </div>
                    </div>
                </div>

                <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700 bg-zinc-800">
                    <img 
                        src="/logo_wide.webp" 
                        alt="Live Showroom" 
                        className="w-full h-full object-cover opacity-20 grayscale brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-ping absolute inset-0" />
                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl relative z-10">
                                <Video className="w-10 h-10 text-white fill-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-widest italic">Live Showroom</p>
                            <div className="flex items-center gap-1.5 justify-center mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-tighter">Online & Ready</p>
                            </div>
                        </div>
                    </div>
                    {/* Floating "Recording" Badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 shadow-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        LIVE
                    </div>
                    {/* Viewer Count */}
                    <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest border border-white/5">
                         84 Viewers
                    </div>
                </div>
            </div>
        </div>
    );
}
