"use client";

import { useEffect, useState } from "react";
import { X, Calendar } from "lucide-react";
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
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // Spring-like ease out
                        className="relative w-full md:w-[480px] lg:w-[540px] h-full bg-white shadow-2xl flex flex-col z-10"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-md">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="font-black text-foreground tracking-tight leading-none text-base md:text-lg">Book Live Video Call</h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-0 pb-20 md:pb-6 relative bg-gray-50/50">
                            {/* Product Context Banner */}
                            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-5 shadow-inner">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Requesting Live Video Demo For</p>
                                        <h3 className="font-black text-lg md:text-xl truncate tracking-tight">{productName}</h3>
                                        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            <span className="text-[10px] font-bold text-zinc-200">100% Refundable Deposit</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Price</p>
                                        <p className="font-black text-lg text-white tabular-nums">₹{productPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* The existing booking module */}
                            <div className="p-4 md:p-6 pb-24 md:pb-6">
                                <SlotBookingSection
                                    productId={productId}
                                    productName={productName}
                                    productPrice={productPrice}
                                />
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
