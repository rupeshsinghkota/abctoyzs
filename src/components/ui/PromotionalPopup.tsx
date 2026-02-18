"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Gift, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function PromotionalPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const [isSupressed, setIsSupressed] = useState(true); // Default to suppressed

    useEffect(() => {
        const checkSuppression = async () => {
            // 1. Fast checks (local storage)
            const hasSeenPopup = sessionStorage.getItem("hasSeenPromoPopup");
            const hasEngaged = localStorage.getItem("hasEngagedWhatsApp");
            const isLead = localStorage.getItem("isLeadCaptured");

            if (hasSeenPopup || hasEngaged || isLead) {
                setIsSupressed(true);
                return;
            }

            // 2. Auth check (Supabase)
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                sessionStorage.setItem("hasSeenPromoPopup", "true");
                setIsSupressed(true);
                return;
            }

            // 3. Not suppressed
            setIsSupressed(false);
        };

        checkSuppression();
    }, []);

    useEffect(() => {
        if (isSupressed) return;

        const handleExitIntent = (e: MouseEvent) => {
            // Trigger if mouse leaves from the top of the viewport
            if (e.clientY <= 0) {
                setShouldRender(true);
                setTimeout(() => setIsVisible(true), 100);
            }
        };

        // Fallback for mobile: Show after 30 seconds if no exit intent
        const mobileTimer = setTimeout(() => {
            if (window.innerWidth < 768 && !sessionStorage.getItem("hasSeenPromoPopup")) {
                setShouldRender(true);
                setTimeout(() => setIsVisible(true), 100);
            }
        }, 30000);

        document.addEventListener("mouseleave", handleExitIntent);

        return () => {
            document.removeEventListener("mouseleave", handleExitIntent);
            clearTimeout(mobileTimer);
        };
    }, [isSupressed]);

    const handleClose = () => {
        setIsVisible(false);
        // Save to session storage so it doesn't annoy them again
        sessionStorage.setItem("hasSeenPromoPopup", "true");
        setTimeout(() => setShouldRender(false), 500);
    };

    const handleClaim = () => {
        const phoneNumber = "918239269217";
        // Updated message for the "Wait" context
        const message = encodeURIComponent("Wait! I don't want to miss out. Please send me the 10% OFF discount code! 🎁");
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
        handleClose();
    };

    if (!shouldRender) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 bg-zinc-950/60 backdrop-blur-sm",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <div className={cn(
                "relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 transform",
                isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-12"
            )}>
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Top Section - Visual (Red for Urgency) */}
                <div className="h-48 bg-[#E11D48] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent pointer-events-none" />

                    {/* Decorative Elements */}
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative text-center space-y-2 p-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="w-16 h-16 bg-white text-[#E11D48] rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-black/10 -rotate-3">
                            <Gift className="w-8 h-8" />
                        </div>
                        <h3 className="text-white font-black text-2xl tracking-tight uppercase px-4 drop-shadow-md">
                            Wait! Don't Go!
                        </h3>
                    </div>
                </div>

                {/* Bottom Section - Content */}
                <div className="p-8 space-y-6 text-center">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                            Last Chance Offer
                        </div>
                        <h2 className="text-3xl font-black text-zinc-900 leading-tight">
                            Get <span className="text-[#E11D48] italic">10% OFF</span> Now?
                        </h2>
                        <p className="text-sm text-zinc-500 font-medium px-4">
                            We'll send the coupon directly to your WhatsApp. Don't leave empty handed!
                        </p>
                    </div>

                    <button
                        onClick={handleClaim}
                        className="group w-full py-4 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span>Send Me The Code</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button
                        onClick={handleClose}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-wide"
                    >
                        No thanks, I hate saving money
                    </button>
                </div>
            </div>
        </div>
    );
}
