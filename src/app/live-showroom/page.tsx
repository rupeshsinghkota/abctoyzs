"use client";

import { Video, Calendar, ShieldCheck, Sparkles, Smartphone, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { SlotBookingSection } from "@/components/product/SlotBookingSection";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LiveShowroomPage() {
    const [showBooking, setShowBooking] = useState(false);

    const stats = [
        { label: "Daily Tours", value: "48+" },
        { label: "Expert Guides", value: "12" },
        { label: "HD Quality", value: "4K" },
        { label: "Trust Score", value: "4.9/5" }
    ];

    const steps = [
        {
            icon: Calendar,
            title: "Pick your Slot",
            desc: "Choose a convenient time for your private 1-on-1 tour."
        },
        {
            icon: Video,
            title: "Join Google Meet",
            desc: "Connect via HD video and see every detail of your favorite toy."
        },
        {
            icon: ShieldCheck,
            title: "Get ₹99 Credit",
            desc: "Your commitment fee is applied as a discount on your order!"
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/10 pointer-events-none" />
                <div className="absolute top-0 right-0 -tr-32 w-96 h-96 bg-primary/20 blur-[120px] rounded-full opacity-50" />
                
                <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Exclusive Showroom Access
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8"
                    >
                        See the Magic <br />
                        <span className="text-primary italic">Live on Call.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12"
                    >
                        Don&apos;t just trust a photo. Book a private <strong>Google Meet</strong> tour of our Delhi showroom and see every detail before you buy.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <button 
                            onClick={() => {
                                setShowBooking(true);
                                document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full sm:w-auto px-12 py-6 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Calendar className="w-5 h-5" />
                            Book Google Meet Tour
                        </button>
                        <a 
                            href="https://wa.me/917557777998?text=Hi%20ABC%20Toyz,%20I%20want%20to%20see%20a%20toy%20live%20right%20now!"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Smartphone className="w-5 h-5" />
                            Quick WhatsApp Tour
                        </a>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mt-24 border-t border-white/5 pt-12"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</p>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="py-24 bg-white">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-zinc-950 tracking-tighter">Your Private Showroom <span className="text-primary italic">Experience.</span></h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">3 Simple Steps to Confidence</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {steps.map((step, i) => (
                            <div key={i} className="group p-10 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5">
                                <div className="w-16 h-16 rounded-3xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                                    <step.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-950 mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-zinc-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LIVE PREVIEW / TRUST SECTION */}
            <section className="py-24 bg-zinc-50 border-y border-zinc-100">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black text-zinc-950 tracking-tighter leading-none">
                                Why Parents <br/>
                                <span className="text-primary italic">Choose Video Calls?</span>
                            </h2>
                            <div className="space-y-6">
                                {[
                                    "Check the exact seat comfort and luxury finish.",
                                    "Test the multi-point remote control safety live.",
                                    "See the toy side-by-side for size perspective.",
                                    "No surprises—what you see is what you get."
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        </div>
                                        <p className="text-zinc-700 font-bold text-sm tracking-tight">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                            <img 
                                src="/logo_wide.webp" 
                                alt="Showroom Preview" 
                                className="w-full h-full object-cover grayscale opacity-20 bg-zinc-900" 
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl animate-pulse">
                                    <Video className="w-10 h-10 text-white fill-white" />
                                </div>
                                <p className="mt-4 text-white font-black text-sm uppercase tracking-widest italic">Preview Video Coming Soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BOOKING SECTION */}
            <section id="booking-section" className="py-24">
                <div className="container max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                             Limited Slots Available
                        </div>
                        <h2 className="text-4xl font-black text-zinc-950 tracking-tighter">Reserve your <span className="text-primary italic">Spot.</span></h2>
                    </div>
                    
                    {/* Reusing the existing SlotBookingSection */}
                    <SlotBookingSection 
                        productId="GENERAL_TOUR" 
                        productName="Private Showroom Tour" 
                        productPrice={0} // SlotBookingSection handles the ₹99 logic internally via its API
                    />
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-24 bg-zinc-950 text-white">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {[
                            { name: "Priya M.", city: "Mumbai", text: "The video call changed everything. I was worried it would be too small for my 4yo, but the expert showed it next to a chair and I booked instantly!" },
                            { name: "Rohit S.", city: "Delhi", text: "Honest and clear. They even showed me how the assembly works on Google Meet. Truly a premium service for parents." },
                            { name: "Ananya K.", city: "Bangalore", text: "Value for money. The ₹99 was credited back within seconds of my order. Highly recommended!" }
                        ].map((t, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6">
                                <div className="flex text-primary">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-zinc-400 italic font-medium leading-relaxed">&quot;{t.text}&quot;</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-xs">{t.name[0]}</div>
                                    <div>
                                        <p className="text-sm font-black">{t.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.city}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
