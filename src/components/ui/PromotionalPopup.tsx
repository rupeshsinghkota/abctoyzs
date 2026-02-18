"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Gift, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PromotionalPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Check if user has already seen/closed the popup in this session
        const hasSeenPopup = sessionStorage.getItem("hasSeenPromoPopup");

        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setShouldRender(true);
                // Trigger animation after a tiny delay for transition to work
                setTimeout(() => setIsVisible(true), 100);
            }, 10000); // Show after 10 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Save to session storage so it doesn't annoy them again in the same tab session
        sessionStorage.setItem("hasSeenPromoPopup", "true");
        setTimeout(() => setShouldRender(false), 500);
    };

    const handleClaim = () => {
        const phoneNumber = "918239269217";
        const message = encodeURIComponent("I saw the 10% OFF offer! How can I get my Secret discount code? 🎁");
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
        handleClose();
    };

    if (!shouldRender) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 bg-zinc-950/20 backdrop-blur-sm",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <div className={cn(
                "relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 transform",
                isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-12"
            )}>
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Top Section - Visual */}
                <div className="h-48 bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-black pointer-events-none" />

                    {/* Decorative Elements */}
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />

                    <div className="relative text-center space-y-2 p-6">
                        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20 rotate-3">
                            <Gift className="w-8 h-8" />
                        </div>
                        <h3 className="text-white font-black text-2xl tracking-tight uppercase px-4">
                            First Order Bonus
                        </h3>
                    </div>
                </div>

                {/* Bottom Section - Content */}
                <div className="p-8 space-y-6 text-center">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Exclusive Offer
                        </div>
                        <h2 className="text-3xl font-black text-zinc-900 leading-tight">
                            Get <span className="text-primary italic">10% OFF</span> Today!
                        </h2>
                        <p className="text-sm text-zinc-500 font-medium px-4">
                            Join our community on WhatsApp to unlock your discount code for premium ride-on toys.
                        </p>
                    </div>

                    <button
                        onClick={handleClaim}
                        className="group w-full py-4 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span>Claim on WhatsApp</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>

                    <p className="text-[10px] text-zinc-400 font-medium">
                        *Valid on orders above ₹1999. First-time customers only.
                    </p>
                </div>
            </div>
        </div>
    );
}
