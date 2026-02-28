"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Video } from "lucide-react";
import { SlotBookingSection } from "./SlotBookingSection";
import { AnimatePresence, motion } from "framer-motion";

interface ProductBookingDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: string;
    productPrice: number;
}

export function ProductBookingDrawer({ isOpen, onClose, productName, productId, productPrice }: ProductBookingDrawerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full md:w-[500px] lg:w-[600px] h-full bg-zinc-950 shadow-2xl flex flex-col z-10 border-l border-white/5"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Video className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-black text-white tracking-tight text-lg">Live Experience</h2>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Showroom Consultation</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto no-scrollbar relative">
                            {/* Product Context Banner */}
                            <div className="bg-zinc-900/50 p-6 border-b border-white/5">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-xl text-white truncate tracking-tight">{productName}</h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Personal Walkthrough</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Price</p>
                                        <p className="font-black text-xl text-white">₹{productPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* The booking module - remove the container styling as SlotBookingSection now handles it */}
                            <div className="pb-24">
                                <SlotBookingSection
                                    productId={productId}
                                    productName={productName}
                                    productPrice={productPrice}
                                    isDrawer={true}
                                />
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
