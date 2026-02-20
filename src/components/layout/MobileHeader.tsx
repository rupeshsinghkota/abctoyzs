"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Search, Menu, X, Home, Navigation, Package, MapPin, HelpCircle, Lock, ShoppingCart, CarFront, Bike, Truck, Gamepad2, Gauge, Mountain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { VEHICLE_CATEGORIES, POWER_CATEGORIES, AGE_CATEGORIES } from "@/lib/data";
import { useAdmin } from "@/hooks/useAdmin";
import { useStore } from "@/store/useStore";

import { useBackToClose } from "@/hooks/useBackToClose";

export function MobileHeader() {
    const { isAdmin } = useAdmin();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useBackToClose(isMenuOpen, () => setIsMenuOpen(false));

    useEffect(() => {
        setMounted(true);
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const MobileDrawer = () => {
        if (!mounted) return null;

        return createPortal(
            <>
                {/* Backdrop */}
                <div
                    className={cn(
                        "fixed inset-0 bg-black/60 z-[999] transition-opacity duration-300 backdrop-blur-sm",
                        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer Container */}
                <div
                    className={cn(
                        "fixed inset-y-0 left-0 z-[1000] w-[85vw] max-w-[320px] bg-background/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-out border-r border-border/10 flex flex-col",
                        isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* Header: Logo & Close */}
                    <div className="flex-none flex items-center justify-between p-5 border-b border-border/10">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="active:scale-95 transition-transform">
                            <img
                                src="/logo_wide.png"
                                alt="ABC Toyz"
                                className="h-6 w-auto object-contain"
                            />
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 -mr-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto min-h-0 py-2">
                        <div className="p-4 space-y-1">
                            {/* Primary Links */}
                            <Link
                                href="/"
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors text-foreground/80 hover:text-primary font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Home className="w-5 h-5" strokeWidth={1.5} />
                                Home
                            </Link>

                            <Link
                                href="/category/all"
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors text-foreground/80 hover:text-primary font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Package className="w-5 h-5" strokeWidth={1.5} />
                                Shop All
                            </Link>

                            <div className="h-px bg-border/20 my-2 mx-3" />

                            {/* The Garage (Grid UI) */}
                            <div className="pt-2 pb-4">
                                <div className="px-3 mb-4 flex items-center justify-between border-l-2 border-primary ml-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900/60">The Garage</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3 px-3">
                                    {VEHICLE_CATEGORIES.map((cat) => {
                                        const Icon = {
                                            cars: CarFront,
                                            jeeps: Truck,
                                            bikes: Bike,
                                            atvs: Zap,
                                            utvs: Gamepad2,
                                            gokarts: Gauge,
                                            dirtbikes: Mountain,
                                            scooters: Zap,
                                        }[cat.value] || Package;

                                        return (
                                            <Link
                                                key={cat.value}
                                                href={`/category/${cat.value}`}
                                                className="flex flex-col items-center gap-3 p-5 rounded-[24px] bg-white border border-gray-100 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] hover:border-primary/30 transition-all active:scale-95 group"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                    <Icon className="w-5 h-5" strokeWidth={2} />
                                                </div>
                                                <span className="text-[11px] font-extrabold text-gray-800 tracking-tight">{cat.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="h-px bg-border/20 my-2 mx-3" />

                            {/* Shop By Needs */}
                            <div className="pt-2 pb-4">
                                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900/60 mb-4 border-l-2 border-primary ml-1">Shop By Needs</h3>
                                <div className="space-y-1">
                                    <div className="px-3">
                                        <p className="text-[10px] font-bold text-gray-400 mb-2.5 ml-1">By Power</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {POWER_CATEGORIES.slice(0, 4).map((power) => (
                                                <Link
                                                    key={power.value}
                                                    href={`/category/power/${power.value}`}
                                                    className="px-3.5 py-1.5 rounded-xl bg-gray-50 text-[11px] font-bold text-gray-700 hover:bg-primary/10 hover:text-primary border border-gray-100 transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {power.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-3 pt-5">
                                        <p className="text-[10px] font-bold text-gray-400 mb-2.5 ml-1">By Age</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {AGE_CATEGORIES.slice(0, 4).map((age) => (
                                                <Link
                                                    key={age.value}
                                                    href={`/category/age/${age.value}`}
                                                    className="px-3.5 py-1.5 rounded-xl bg-gray-50 text-[11px] font-bold text-gray-700 hover:bg-primary/10 hover:text-primary border border-gray-100 transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {age.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex-none p-5 border-t border-border/10 bg-gray-50/50 backdrop-blur-md">
                        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all active:scale-95 group"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Lock className="w-5 h-5 mb-1.5 text-primary" strokeWidth={1.5} />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Admin</span>
                                </Link>
                            )}
                            <Link
                                href="/track-order"
                                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100 hover:border-primary/50 transition-all active:scale-95 group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <MapPin className="w-5 h-5 mb-1.5 text-gray-500 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover:text-primary transition-colors">Track</span>
                            </Link>
                            <Link
                                href="/contact-us"
                                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100 hover:border-primary/50 transition-all active:scale-95 group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <HelpCircle className="w-5 h-5 mb-1.5 text-gray-500 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover:text-primary transition-colors">Help</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </>,
            document.body
        );
    };

    return (
        <>
            <div className="w-full h-14 border-b border-border/10">
                <div className="flex items-center justify-between px-4 h-full">
                    {/* Left: Menu & Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 -ml-2 text-muted-foreground hover:text-primary active:scale-95 transition-all"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" strokeWidth={1.5} />
                        </button>

                        <Link href="/" className="flex items-center active:scale-95 transition-transform">
                            <img
                                src="/logo_wide.png"
                                alt="ABC Toyz"
                                className="h-6 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Right: Search & Cart */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/search"
                            className="p-2 text-muted-foreground hover:text-primary active:scale-95 transition-all"
                        >
                            <Search className="w-5 h-5" strokeWidth={1.5} />
                        </Link>

                        <Link
                            href="/cart"
                            className="p-2 text-muted-foreground hover:text-primary active:scale-95 transition-all relative"
                        >
                            <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                            {(() => {
                                const cart = useStore(state => state.cart);
                                const count = cart.reduce((acc, item) => acc + item.quantity, 0);
                                if (count === 0) return null;
                                return (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[10px] font-black text-white flex items-center justify-center rounded-full ring-2 ring-white">
                                        {count}
                                    </span>
                                );
                            })()}
                        </Link>
                    </div>
                </div>
            </div>

            <MobileDrawer />
        </>
    );
}
