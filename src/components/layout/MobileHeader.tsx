"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Search, ShoppingBag, Menu, X, Home, Grid, User, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { VEHICLE_CATEGORIES, POWER_CATEGORIES, AGE_CATEGORIES } from "@/lib/data";

export function MobileHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body scroll when menu is open
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

                {/* Drawer */}
                <div
                    className={cn(
                        "fixed inset-y-0 left-0 z-[1000] w-[280px] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out border-r border-border/10",
                        isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">abctoyz</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-muted rounded-full">
                            <X className="w-6 h-6" strokeWidth={1.5} />
                        </button>
                    </div>
                    <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
                        <Link href="/" className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <Home className="w-5 h-5 text-primary" strokeWidth={1.5} />
                            <span className="font-medium">Home</span>
                        </Link>

                        <Link href="/category/all" className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <Package className="w-5 h-5 text-primary" strokeWidth={1.5} />
                            <span className="font-medium">Shop All</span>
                        </Link>

                        <div className="py-2">
                            <div className="flex items-center gap-3 p-3 text-muted-foreground">
                                <Grid className="w-5 h-5 text-primary" strokeWidth={1.5} />
                                <span className="font-semibold text-sm uppercase tracking-wider">Categories</span>
                            </div>
                            <div className="pl-11 space-y-1">
                                {VEHICLE_CATEGORIES.map((cat) => (
                                    <Link
                                        key={cat.value}
                                        href={`/category/${cat.value}`}
                                        className="block p-2 text-sm text-foreground/80 hover:text-primary transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {cat.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* By Power */}
                        <div className="py-2 border-t border-border/40">
                            <div className="flex items-center gap-3 p-3 text-muted-foreground">
                                <div className="w-5 h-5 rounded-full border-2 border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary">V</div>
                                <span className="font-semibold text-sm uppercase tracking-wider">By Power</span>
                            </div>
                            <div className="pl-11 space-y-1">
                                {POWER_CATEGORIES.map((power) => (
                                    <Link
                                        key={power.value}
                                        href={`/category/power/${power.value}`}
                                        className="block p-2 text-sm text-foreground/80 hover:text-primary transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {power.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* By Age */}
                        <div className="py-2 border-t border-border/40">
                            <div className="flex items-center gap-3 p-3 text-muted-foreground">
                                <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
                                <span className="font-semibold text-sm uppercase tracking-wider">By Age</span>
                            </div>
                            <div className="pl-11 space-y-1">
                                {AGE_CATEGORIES.map((age) => (
                                    <Link
                                        key={age.value}
                                        href={`/category/age/${age.value}`}
                                        className="block p-2 text-sm text-foreground/80 hover:text-primary transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {age.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link href="/cart" className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <ShoppingBag className="w-5 h-5 text-primary" strokeWidth={1.5} />
                            <span className="font-medium">My Cart</span>
                        </Link>
                        <Link href="/profile" className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
                            <span className="font-medium">Profile</span>
                        </Link>
                    </div>
                </div>
            </>,
            document.body
        );
    };

    return (
        <>
            <div className="w-full bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40">
                <div className="flex items-center justify-between px-4 h-14">
                    {/* Left: Menu & Logo */}
                    <div className="flex items-center gap-3">
                        <button
                            className="p-2 -ml-2 hover:bg-accent rounded-full z-20 transition-colors"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        <Link href="/" className="flex items-center">
                            <img
                                src="/logo_wide.png"
                                alt="ABC TOYZ"
                                className="h-6 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                        <Link href="/search" className="p-2 hover:bg-secondary/50 rounded-full transition-colors text-foreground/80">
                            <Search className="w-5 h-5" strokeWidth={1.5} />
                        </Link>

                        <Link href="/cart" className="p-2 hover:bg-secondary/50 rounded-full transition-colors text-foreground/70 hover:text-foreground relative">
                            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                    </div>
                </div>
            </div>

            <MobileDrawer />
        </>
    );
}
