"use client";

import { useStore } from '@/store/useStore';
import { X, ArrowRightLeft, Trash2, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function CompareDrawer() {
    const { compareItems, removeFromCompare, clearCompare } = useStore();

    if (compareItems.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-3 md:p-4 flex items-center justify-between gap-4 overflow-hidden"
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-full opacity-10 pointer-events-none overflow-hidden">
                    <ArrowRightLeft className="w-full h-full text-white rotate-12 scale-110" />
                </div>

                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar py-1">
                    <AnimatePresence mode="popLayout">
                        {compareItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="relative group shrink-0"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-800">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <button
                                    onClick={() => removeFromCompare(item.id)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <X className="w-3 h-3" strokeWidth={3} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {compareItems.length < 4 && (
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-600 shrink-0">
                            <LayoutGrid className="w-4 h-4 md:w-6 md:h-6" />
                            <span className="text-[8px] md:text-[10px] font-bold uppercase mt-0.5 tracking-tighter">Add More</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-2 shrink-0">
                    <div className="hidden md:block mr-2 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Comparing</p>
                        <p className="text-sm font-black text-white">{compareItems.length} Products</p>
                    </div>

                    <Link
                        href="/compare"
                        className="bg-primary text-white h-12 md:h-14 px-6 md:px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                        Compare Now
                        <ArrowRightLeft className="w-4 h-4" />
                    </Link>

                    <button
                        onClick={clearCompare}
                        className="p-3 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Clear all"
                    >
                        <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
