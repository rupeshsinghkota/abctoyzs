"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

const NUDGE_KEY = "aura_nudge_seen";
const COOLDOWN_DAYS = 1; // Show once per day

export function WhatsAppNudge() {
    const pathname = usePathname();
    const { recentlyViewed } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [config, setConfig] = useState({ message: "", header: "Expert Guide", waMessage: "" });
    const [isDismissed, setIsDismissed] = useState(false);

    const showNudge = useCallback((msg: string, header = "Personal Expert Guide", waMsg = "") => {
        if (isDismissed) return;

        // Check localStorage for cooldown
        const lastSeen = localStorage.getItem(NUDGE_KEY);
        if (lastSeen) {
            const lastDate = new Date(parseInt(lastSeen));
            const now = new Date();
            const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays < COOLDOWN_DAYS) return;
        }

        setConfig({
            message: msg,
            header,
            waMessage: waMsg || `Hi! I was browsing your site and wanted to ask something.`
        });
        setIsVisible(true);
        localStorage.setItem(NUDGE_KEY, Date.now().toString());
    }, [isDismissed]);

    useEffect(() => {
        // Determine Page Context
        const isProduct = pathname?.startsWith("/product/");
        const isCategory = pathname?.startsWith("/category/");
        const isCart = pathname === "/cart";
        const isHome = pathname === "/";

        // 1. Inactivity Nudge (20 seconds - USER REQUEST)
        const timer = setTimeout(() => {
            if (isProduct) {
                const productName = recentlyViewed[0]?.name || "this model";
                showNudge(
                    `Need a real unboxing video of the ${productName}? Ask us! 🎥`,
                    "Product Specialist",
                    `Hi! I'm interested in the ${productName}. Can I see a real video?`
                );
            } else if (isCategory) {
                showNudge(
                    "Confused between 12V vs 24V? Let us help you choose the right power! ⚡",
                    "Selection Expert",
                    "Hi! Help me choose the right toy for my kid's age and weight."
                );
            } else if (isCart) {
                showNudge(
                    "Checking shipping? We offer FREE delivery India-wide! Need help? 🚚",
                    "Order Support",
                    "Hi! I'm at the cart and have a quick question before I order."
                );
            } else if (isHome) {
                showNudge(
                    "Looking for the perfect gift? Ask our experts for recommendations! 🎁",
                    "Gift Guide",
                    "Hi! I need help picking a gift for my kid."
                );
            }
        }, 20000); // Trigger after 20 seconds as requested

        // 2. Desktop Exit Intent (Mouse Leave)
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                if (isProduct) {
                    const productName = recentlyViewed[0]?.name || "this toy";
                    showNudge(
                        `Wait! Have a question about the ${productName} before you go? 🧸`,
                        "Quick Help",
                        `Hi! I have a question about the ${productName} before I leave.`
                    );
                } else {
                    showNudge(
                        "Wait! Didn't find what you were looking for? Ask us! 🔍",
                        "Store Guide",
                        "Hi! I'm looking for something specific but couldn't find it."
                    );
                }
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

            // If user scrolls up faster than 1200px/s (aggressive pull to top/URL bar)
            if (scrollDelta > 120 && timeDelta < 100 && currentScrollY < 1200) {
                showNudge(
                    "Found what you need? We can help you pick the perfect ride-on! 🎁",
                    "Gift Expert",
                    "Hi! I need help picking a gift. Can you suggest something?"
                );
            }

            lastScrollY = currentScrollY;
            lastScrollTime = currentTime;
        };

        // 4. Tab Visibility (Welcome Back)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // Short delay to not be jarring immediately on return
                setTimeout(() => {
                    showNudge(
                        "Welcome back! Ready to see some real action videos for our toys? 🍿",
                        "Quality Assurance",
                        "Hi! I'm back. Can you show me some more videos of your top models?"
                    );
                }, 2000);
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
    }, [pathname, showNudge, recentlyViewed]);

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
                            {config.header}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                            {config.message}
                        </p>
                    </div>
                </div>

                <a
                    href={`https://wa.me/917557777998?text=${encodeURIComponent(config.waMessage + `\n\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        // Capture "Chat Lead" intent if we already know who this is
                        const phone = localStorage.getItem("verified_phone") ||
                            localStorage.getItem("lead_phone") ||
                            localStorage.getItem("captured_phone");

                        if (phone && phone.length >= 10) {
                            fetch('/api/leads', {
                                method: 'POST',
                                body: JSON.stringify({
                                    phone: phone,
                                    source: 'whatsapp_nudge_click',
                                    cart_summary: recentlyViewed.slice(0, 1).map(p => ({
                                        name: p.name,
                                        image: p.image,
                                        price: p.price
                                    }))
                                })
                            }).catch(() => { }); // Silent fail for lead tracking
                        }
                    }}
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
