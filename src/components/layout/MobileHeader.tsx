"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Search, Menu, X, Home, Navigation, Package, MapPin, HelpCircle, Lock, ShoppingCart } from "lucide-react";
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
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {/* Inline Search Bar */}
                        <div className="p-4 pb-0">
                            <form action="/search" className="relative" onSubmit={() => setIsMenuOpen(false)}>
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="Search ride-on toys..."
                                    className="w-full bg-secondary/50 border border-border/20 rounded-2xl h-12 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 font-medium"
                                />
                            </form>
                        </div>

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
                                <div className="px-3 mb-3 flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">The Garage</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2 px-2">
                                    {VEHICLE_CATEGORIES.map((cat) => (
                                        <Link
                                            key={cat.value}
                                            href={`/category/${cat.value}`}
                                            className="flex flex-col p-3 rounded-2xl bg-secondary/30 hover:bg-primary/5 border border-border/20 hover:border-primary/20 transition-all active:scale-95 group"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span className="text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">{cat.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-border/20 my-2 mx-3" />

                            {/* Shop By Needs */}
                            <div className="pt-2 pb-4">
                                <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Shop By Needs</h3>
                                <div className="space-y-1">
                                    <div className="px-2">
                                        <p className="text-[10px] font-bold text-muted-foreground/60 mb-2 pl-2">By Power</p>
                                        <div className="flex flex-wrap gap-2">
                                            {POWER_CATEGORIES.slice(0, 4).map((power) => (
                                                <Link
                                                    key={power.value}
                                                    href={`/category/power/${power.value}`}
                                                    className="px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {power.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-2 pt-3">
                                        <p className="text-[10px] font-bold text-muted-foreground/60 mb-2 pl-2">By Age</p>
                                        <div className="flex flex-wrap gap-2">
                                            {AGE_CATEGORIES.slice(0, 4).map((age) => (
                                                <Link
                                                    key={age.value}
                                                    href={`/category/age/${age.value}`}
                                                    className="px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors"
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
                    <div className="flex-none p-5 border-t border-border/10 bg-secondary/20">
                        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all shadow-sm active:scale-95 group"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Lock className="w-5 h-5 mb-1.5 text-primary" strokeWidth={1.5} />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Admin</span>
                                </Link>
                            )}
                            <Link
                                href="/track-order"
                                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all shadow-sm active:scale-95 group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <MapPin className="w-5 h-5 mb-1.5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">Track</span>
                            </Link>
                            <Link
                                href="/contact-us"
                                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all shadow-sm active:scale-95 group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <HelpCircle className="w-5 h-5 mb-1.5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">Help</span>
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
