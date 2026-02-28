"use client";

import { Video, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LiveDemoFloatingButton() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Only show on product pages or home, and wait a bit
    useEffect(() => {
        if (isDismissed) return;

        const timer = setTimeout(() => {
            const isTargetPage = pathname === '/' || pathname?.startsWith('/product/');
            const isForbiddenPage = pathname?.startsWith('/admin') || pathname?.startsWith('/checkout') || pathname?.startsWith('/cart');

            if (isTargetPage && !isForbiddenPage) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [pathname, isDismissed]);

    if (isDismissed || !isVisible) return null;

    return (
        <div className="fixed bottom-24 left-6 z-[45] group md:bottom-32 md:left-8">
            <div className="relative">
                {/* Tooltip / Label */}
                <div className="absolute left-14 bottom-1/2 translate-y-1/2 bg-zinc-900 text-white px-4 py-2 rounded-xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">Live Demo</p>
                    <p className="text-xs font-bold leading-none">Book Video Showcase for ₹99</p>
                </div>

                {/* Main Pulsating Button */}
                <button
                    onClick={() => {
                        // We track where they came from
                        // If on product page, it's better to just scroll to the section 
                        // or open the generic booking drawer if implemented
                        const bookingSection = document.getElementById('booking-section');
                        if (bookingSection) {
                            bookingSection.scrollIntoView({ behavior: 'smooth' });
                        } else {
                            window.location.href = '/category/all'; // fallback
                        }
                    }}
                    className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all relative z-10 active:scale-95 border border-white/10"
                >
                    <Video className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" strokeWidth={3} />

                    {/* Pulsating Ring */}
                    <span className="absolute inset-0 rounded-2xl bg-primary animate-ping opacity-20 -z-10" />
                </button>

                {/* Dismiss Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDismissed(true);
                    }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors z-20"
                >
                    <X className="w-2 h-2" />
                </button>
            </div>
        </div>
    );
}
