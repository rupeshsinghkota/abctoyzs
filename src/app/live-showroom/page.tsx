"use client";

import { Video, Calendar, ShieldCheck, Sparkles, Smartphone, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LiveShowroomPage() {
    const stats = [
        { label: "Daily Tours", value: "48+" },
        { label: "Expert Guides", value: "12" },
        { label: "HD Quality", value: "4K" },
        { label: "Trust Score", value: "4.9/5" }
    ];

    const steps = [
        {
            icon: Smartphone,
            title: "1. Pick your Model",
            desc: "Browse our collection of luxury electric cars, bikes, and jeeps."
        },
        {
            icon: Calendar,
            title: "2. Book Video Tour",
            desc: "Select the Video Tour option on any product page or during Checkout."
        },
        {
            icon: Video,
            title: "3. Join on Meet",
            desc: "Get a private HD walkthrough for ₹99 (Refundable credit on order)."
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/brain/15843977-c906-41df-9bda-02839106f186/delhi_showroom_premium_view_1773923347505.png" 
                        alt="Showroom Background" 
                        className="w-full h-full object-cover opacity-40 brightness-[0.3]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                </div>

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
                        <span className="text-primary italic">Detail by Detail.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12"
                    >
                        Don&apos;t just trust a photo. Book a private **Google Meet** tour of our Delhi showroom and see every detail before you buy.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <a 
                            href="/category/all"
                            className="w-full sm:w-auto px-12 py-6 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            Start Shopping & Book
                            <ArrowRight className="w-5 h-5" />
                        </a>
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
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">Choose any toy and see it live</p>
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
            <section className="py-24 bg-zinc-50 border-y border-zinc-100 overflow-hidden">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="relative">
                            <motion.div 
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-zinc-200"
                            >
                                <img 
                                    src="/brain/15843977-c906-41df-9bda-02839106f186/video_call_expert_guide_1773923364585.png" 
                                    alt="Expert Video Call" 
                                    className="w-full h-auto"
                                />
                                <div className="absolute top-6 left-6 px-3 py-1 bg-red-600 rounded-full text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    LIVE FEED
                                </div>
                            </motion.div>
                            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-0" />
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black text-zinc-950 tracking-tighter leading-none">
                                Expert Walkthroughs <br/>
                                <span className="text-primary italic">from our Delhi Hub.</span>
                            </h2>
                            <p className="text-zinc-500 font-medium leading-relaxed">
                                Our product specialists are ready to show you every chrome finish, battery detail, and safety feature. It&apos;s as good as being here in person.
                            </p>
                            <div className="space-y-6">
                                {[
                                    "Check the exact seat comfort and luxury finish.",
                                    "Test the multi-point remote control safety live.",
                                    "See the toy side-by-side for size perspective.",
                                    "Get answers to technical questions instantly."
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                        </div>
                                        <p className="text-zinc-700 font-bold text-sm tracking-tight">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST SECTION 2 */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black text-zinc-950 tracking-tighter leading-none">
                                Shop with <br/>
                                <span className="text-primary italic">100% Confidence.</span>
                            </h2>
                            <p className="text-zinc-500 font-medium leading-relaxed">
                                Join thousands of happy parents who booked a video call before making their child&apos;s dream come true. No surprises, just smiles.
                            </p>
                            <div className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 flex items-start gap-6">
                                <div className="w-12 h-12 rounded-full bg-zinc-200 shrink-0 overflow-hidden">
                                     <img src="https://i.pravatar.cc/100?u=priya" alt="Priya" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex text-primary">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                                    </div>
                                    <p className="text-zinc-700 font-bold text-sm italic">&quot;Seeing the red jeep on video call convinced me about the size. The expert was so patient!&quot;</p>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Priya M., Mumbai</p>
                                </div>
                            </div>
                            <Link 
                                href="/category/all"
                                className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs group"
                            >
                                Browse All Models <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="order-1 lg:order-2 relative">
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-zinc-200"
                            >
                                <img 
                                    src="/brain/15843977-c906-41df-9bda-02839106f186/satisfied_parent_video_call_1773923382256.png" 
                                    alt="Happy Parent" 
                                    className="w-full h-auto"
                                />
                            </motion.div>
                            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-0" />
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW TO BOOK SECTION */}
            <section className="py-24 bg-zinc-950 text-white text-center">
                <div className="container max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-black tracking-tighter mb-12">How to Book your <span className="text-primary italic">Private Tour?</span></h2>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 text-left">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black">1</div>
                            <h3 className="text-lg font-black">On any Product Page</h3>
                            <p className="text-zinc-500 text-sm font-medium">Click the **\"Book Live Video Tour\"** button next to the Buy button on your favorite model.</p>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 text-left">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black">2</div>
                            <h3 className="text-lg font-black">During Checkout</h3>
                            <p className="text-zinc-500 text-sm font-medium">Select **\"Book Live Video Call\"** as your payment method during the checkout process.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">Ready to find the perfect ride?</p>
                        <Link 
                            href="/category/all"
                            className="inline-flex px-12 py-6 bg-white text-zinc-950 font-black text-xs uppercase tracking-[0.2em] rounded-3xl hover:bg-zinc-100 transition-all active:scale-95 shadow-2xl shadow-white/10"
                        >
                            Start Exploring the Gallery
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
