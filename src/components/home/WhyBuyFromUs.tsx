'use client';

import { CheckCircle2, XCircle, ShieldCheck, Truck, MessageCircle, Banknote, Award, Sparkles, Video } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const features = [
    {
        icon: Video,
        label: 'Live Showroom Tour',
        us: '1-on-1 private video tour to see product live',
        them: 'Stock photos only, no real visibility',
        usShort: 'See it live on video',
    },
    {
        icon: MessageCircle,
        label: 'Customer Support',
        us: 'Real Delhi team on WhatsApp + video setup help',
        them: 'No reply / generic email',
        usShort: 'Delhi team, video help',
    },
    {
        icon: ShieldCheck,
        label: 'Warranty',
        us: '1-Year Motor & Battery Warranty — in writing',
        them: 'No warranty or 30-day only',
        usShort: '1-Year Motor & Battery',
    },
    {
        icon: Banknote,
        label: 'Payment Options',
        us: 'COD + UPI + Cards + Razorpay — your choice',
        them: 'Prepaid only, no COD',
        usShort: 'COD + All options',
    },
    {
        icon: Award,
        label: 'Product Safety',
        us: 'BIS Safety Certified — tested for Indian kids',
        them: 'Unknown certifications',
        usShort: 'BIS Safety Certified',
    },
    {
        icon: Truck,
        label: 'Delivery',
        us: 'Free Pan-India shipping, tracked',
        them: 'Hidden charges or slow delivery',
        usShort: 'Free & tracked',
    },
];

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

export function WhyBuyFromUs() {
    const { ref, inView } = useInView();

    return (
        <section ref={ref} className="py-16 md:py-24 relative overflow-hidden bg-zinc-950">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-black uppercase tracking-widest text-primary mb-5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Why ABC Toyz?
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                        Not just another <span className="text-primary">online seller</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto text-base md:text-lg">
                        We're a real Delhi-based team that actually picks up the phone. Here's what makes us different.
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="max-w-4xl mx-auto">
                    {/* Column Headers */}
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 mb-3 px-3">
                        <div /> {/* feature label col */}
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-primary/30">
                                <CheckCircle2 className="w-3.5 h-3.5" /> ABC Toyz
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 bg-zinc-800 text-zinc-400 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                <XCircle className="w-3.5 h-3.5" /> Others
                            </span>
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-2">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.label}
                                    className="grid grid-cols-[1fr_1fr_1fr] gap-3 items-center rounded-2xl overflow-hidden transition-all duration-700"
                                    style={{
                                        opacity: inView ? 1 : 0,
                                        transform: inView ? 'translateY(0)' : 'translateY(24px)',
                                        transitionDelay: `${i * 80}ms`,
                                    }}
                                >
                                    {/* Feature Label */}
                                    <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3.5 h-full">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-xs font-black text-zinc-200 leading-tight">{f.label}</span>
                                    </div>

                                    {/* ABC Toyz cell */}
                                    <div className="bg-gradient-to-br from-primary/10 to-orange-900/10 border border-primary/25 rounded-xl px-3 py-3.5 h-full flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span className="text-[11px] md:text-xs font-bold text-white leading-snug">
                                            <span className="hidden md:inline">{f.us}</span>
                                            <span className="md:hidden">{f.usShort}</span>
                                        </span>
                                    </div>

                                    {/* Others cell */}
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-3.5 h-full flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                                        <span className="text-[11px] md:text-xs font-medium text-zinc-500 leading-snug">{f.them}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CTA bottom */}
                    <div
                        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700"
                        style={{ opacity: inView ? 1 : 0, transitionDelay: '450ms' }}
                    >
                        <a
                            href="/category/all"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-orange-500 text-white font-black text-sm px-8 py-3.5 rounded-full shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                        >
                            Shop Now — Free Delivery
                        </a>
                        <a
                            href={`https://wa.me/917557777998?text=${encodeURIComponent('Hi ABC Toyz! I have a question before ordering.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-black text-sm px-6 py-3.5 rounded-full transition-all hover:scale-105"
                        >
                            <MessageCircle className="w-4 h-4 text-[#25D366]" />
                            Ask Us on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
