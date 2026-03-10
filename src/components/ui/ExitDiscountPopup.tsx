"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, ArrowRight, Timer } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export function ExitDiscountPopup() {
    const pathname = usePathname();
    const { cart, appliedCoupon, setAppliedCoupon } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    // Calculate Cart Total
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const isEligible = cartTotal >= 2500;

    // Conditions to NOT show
    const isHiddenPage = pathname?.startsWith('/admin') || pathname?.startsWith('/success');

    useEffect(() => {
        if (hasShown || !isEligible || isHiddenPage || appliedCoupon) return;

        // Check if already shown in this session
        if (sessionStorage.getItem('exit_popup_shown')) {
            setHasShown(true);
            return;
        }

        // Push a dummy state to history so we can intercept the first "Back" click
        window.history.pushState({ exitPopup: true }, "");

        const handlePopState = (e: PopStateEvent) => {
            // If the user hits back, this event fires. 
            // Since we pushed a state, the browser stays on the current page but pops our state.
            if (!hasShown) {
                setIsOpen(true);
                setHasShown(true);
                sessionStorage.setItem('exit_popup_shown', 'true');
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasShown, isEligible, isHiddenPage, appliedCoupon]);

    const handleClaim = async () => {
        try {
            // Pre-calculate discount (UI only, real validation happens in checkout)
            const discount = Math.round(cartTotal * 0.05);
            setAppliedCoupon({
                code: 'STAY5',
                discount: discount,
                coupon_id: 'stay5-id' // Temporary placeholder
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to apply STAY5:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
                        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-orange-200/20 blur-3xl rounded-full" />

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="relative p-8 md:p-10 flex flex-col items-center text-center">
                            {/* Icon Animation */}
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6"
                            >
                                <Gift className="w-10 h-10 text-primary" />
                            </motion.div>

                            {/* Text Header */}
                            <div className="space-y-2 mb-8">
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                                    WAIT! OUR <span className="text-primary italic">GIFT</span> TO YOU
                                </h2>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                                    <Sparkles className="w-4 h-4 text-orange-400" /> Exclusive 5% Discount Inside <Sparkles className="w-4 h-4 text-orange-400" />
                                </p>
                            </div>

                            {/* Main Offer Block */}
                            <div className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-6 mb-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <div className="flex flex-col items-center gap-1 mb-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Use Code</span>
                                    <div className="bg-white border-2 border-dashed border-primary/30 px-6 py-2 rounded-xl text-3xl font-black text-primary tracking-widest">
                                        STAY5
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-600">
                                    Valid on your current order of <span className="font-bold text-gray-900">₹{cartTotal.toLocaleString()}</span>
                                </p>
                                <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-bold text-gray-400">
                                    <div className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Expires in 15 mins</div>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <div>Apply at Checkout</div>
                                </div>
                            </div>

                            {/* Call to Action */}
                            <button
                                onClick={handleClaim}
                                className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/25 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                            >
                                CLAIM MY DISCOUNT
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-6 text-[11px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                            >
                                No thanks, I'll pay full price
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
