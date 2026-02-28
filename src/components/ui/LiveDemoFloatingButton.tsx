"use client";

import { Video, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export function LiveDemoFloatingButton() {
    const pathname = usePathname();
    const { openBooking, currentProductContext } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Only show on product pages
    useEffect(() => {
        if (isDismissed) return;

        // Show only on individual product pages
        const isProductPage = pathname?.startsWith('/product/');

        if (isProductPage) {
            setIsVisible(true);
            // Auto-show tooltip for mobile users after a delay, since they can't hover
            const timer = setTimeout(() => setShowTooltip(true), 3000);
            const hideTimer = setTimeout(() => setShowTooltip(false), 7000);
            return () => {
                clearTimeout(timer);
                clearTimeout(hideTimer);
            };
        } else {
            setIsVisible(false);
        }
    }, [pathname, isDismissed]);

    if (isDismissed || !isVisible) return null;

    return (
        <div className="fixed bottom-48 right-5 z-[100] group md:bottom-[164px] md:right-10">
            <div className="relative">
                {/* Amazing Tooltip */}
                <div className={cn(
                    "absolute right-full mr-4 bottom-1/2 translate-y-1/2 bg-zinc-950 text-white px-5 py-3 rounded-2xl border border-white/10 shadow-2xl transition-all pointer-events-none whitespace-nowrap overflow-hidden",
                    showTooltip ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                    {currentProductContext ? 'Product Preview' : 'Live Showroom'}
                                </span>
                            </div>
                            <p className="text-xs font-black tracking-tight">
                                {currentProductContext ? `See ${currentProductContext.productName.split(' ')[0]} Live! 🎥` : 'Tap to See it Live! 🎥'}
                            </p>
                        </div>
                    </div>
                    {/* Inner highlight */}
                    <div className="absolute top-0 right-0 w-20 h-full bg-primary/5 blur-xl -z-10" />
                </div>

                {/* Main Pulsating Button */}
                <button
                    onClick={() => {
                        // If we are on a product page, we can try to extract product info
                        // But it's safer to just call a "Show global booking" and if the site 
                        // is using any product context (like recently viewed), we use that.
                        openBooking();
                    }}
                    className="w-14 h-14 md:w-16 md:h-16 bg-zinc-950 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_40px_rgba(249,115,22,0.3)] transition-all relative z-10 active:scale-95 border border-white/10 group-hover:border-primary/50"
                >
                    <Video className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition-transform" strokeWidth={2.5} />

                    {/* Premium Pulse Circle */}
                    <span className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping -z-10" />

                    {/* Ring Border Animation */}
                    <div className="absolute -inset-1 border border-primary/20 rounded-full group-hover:border-primary/40 transition-colors animate-[spin_4s_linear_infinite]" />
                </button>

                {/* Amazing Badge */}
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-green-500/30">
                    Live
                </div>

                {/* Dismiss Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDismissed(true);
                    }}
                    className="absolute -top-1 -right-1 bg-zinc-800 rounded-full p-1 shadow-lg border border-white/10 text-zinc-500 hover:text-white transition-colors z-20 opacity-0 group-hover:opacity-100"
                >
                    <X className="w-2.5 h-2.5" />
                </button>
            </div>
        </div>
    );
}
