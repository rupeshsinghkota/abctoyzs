"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NUDGE_KEY = "aura_nudge_seen";
const COOLDOWN_DAYS = 1; // Show once per day

export function WhatsAppNudge() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [isDismissed, setIsDismissed] = useState(false);

    const showNudge = useCallback((msg: string) => {
        if (isDismissed) return;

        // Check localStorage for cooldown
        const lastSeen = localStorage.getItem(NUDGE_KEY);
        if (lastSeen) {
            const lastDate = new Date(parseInt(lastSeen));
            const now = new Date();
            const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays < COOLDOWN_DAYS) return;
        }

        setMessage(msg);
        setIsVisible(true);
        localStorage.setItem(NUDGE_KEY, Date.now().toString());
    }, [isDismissed]);

    useEffect(() => {
        // Only nudge on product pages or high-intent areas
        if (!pathname?.startsWith("/product/")) return;

        // 1. Inactivity Nudge (45 seconds)
        const timer = setTimeout(() => {
            showNudge("Need a real unboxing video of this toy? Ask us on WhatsApp! 🎥");
        }, 45000);

        // 2. Desktop Exit Intent (Mouse Leave)
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                showNudge("Wait! Have a question before you go? Chat with our experts! 🤝");
            }
        };

        // 3. Mobile Exit Intent (Fast Scroll Up)
        let lastScrollY = window.scrollY;
        let lastScrollTime = Date.now();

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const currentTime = Date.now();
            const scrollDelta = lastScrollY - currentScrollY;
            const timeDelta = currentTime - lastScrollTime;

            // If user scrolls up faster than 1500px/s (aggressive pull to top/URL bar)
            if (scrollDelta > 100 && timeDelta < 100 && currentScrollY < 1000) {
                showNudge("Wait! Found what you were looking for? We're here to help! 🔍");
            }

            lastScrollY = currentScrollY;
            lastScrollTime = currentTime;
        };

        // 4. Tab Visibility (Welcome Back)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // Short delay to not be jarring immediately on return
                setTimeout(() => {
                    showNudge("Welcome back! Have any questions about this model? 🧸");
                }, 1500);
            }
        };

        document.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("scroll", handleScroll, { passive: true });
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pathname, showNudge]);

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsVisible(false);
        setIsDismissed(true);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-[160px] right-5 md:bottom-32 md:right-10 z-[101] animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 max-w-[280px] group">
                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors shadow-sm"
                >
                    <X className="w-3 h-3" />
                </button>

                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                            Personal Expert Guide
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>
                </div>

                <a
                    href={`https://wa.me/918239269217?text=${encodeURIComponent("Hi! I was looking at a product and wanted to see a real video or have some questions.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block w-full bg-[#25D366] text-white text-[11px] font-black text-center py-2.5 rounded-xl hover:bg-[#128C7E] transition-colors uppercase tracking-widest"
                >
                    Chat Now
                </a>

                {/* Arrow Pointer */}
                <div className="absolute top-full right-6 w-4 h-4 bg-white dark:bg-zinc-900 border-r border-b border-zinc-200 dark:border-zinc-800 rotate-45 -translate-y-2 translate-x-1/2"></div>
            </div>
        </div>
    );
}
