"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Search, ShoppingBag, Menu, X, Home, Grid, User, Package, ChevronDown, ChevronRight, Zap, Baby, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VEHICLE_CATEGORIES, POWER_CATEGORIES, AGE_CATEGORIES } from "@/lib/data";
import { useAdmin } from "@/hooks/useAdmin";

import { useStore } from "@/store/useStore";

export function MobileHeader() {
    const { isAdmin } = useAdmin();
    const cart = useStore((state) => state.cart);
    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Accordion state
    const [openSection, setOpenSection] = useState<string | null>("vehicles");

    useEffect(() => {
        setMounted(true);
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

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
                        "fixed inset-y-0 left-0 z-[1000] w-[85vw] max-w-[320px] bg-background shadow-2xl transition-transform duration-300 ease-out border-r border-border/10 flex flex-col",
                        isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* Header: Logo & Close */}
                    <div className="flex-none flex items-center justify-between p-4 border-b border-border/10 bg-background/95 backdrop-blur">
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>
                            <img
                                src="/logo_wide.png"
                                alt="ABC Toyz"
                                className="h-6 w-auto object-contain"
                            />
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto min-h-0">
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

                            {/* Accordion: Categories */}
                            <div>
                                <button
                                    onClick={() => toggleSection("vehicles")}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                                        openSection === "vehicles" ? "bg-primary/5 text-primary" : "hover:bg-muted/50 text-foreground/80"
                                    )}
                                >
                                    <div className="flex items-center gap-3 font-medium">
                                        <Grid className="w-5 h-5" strokeWidth={1.5} />
                                        Categories
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", openSection === "vehicles" ? "rotate-180" : "")} />
                                </button>

                                <div className={cn(
                                    "grid transition-all duration-300 ease-in-out overflow-hidden",
                                    openSection === "vehicles" ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                                )}>
                                    <div className="min-h-0 pl-11 space-y-1 border-l-2 border-border/10 ml-5 my-1">
                                        {VEHICLE_CATEGORIES.map((cat) => (
                                            <Link
                                                key={cat.value}
                                                href={`/category/${cat.value}`}
                                                className="block py-2 px-3 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/30"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {cat.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Accordion: By Power */}
                            <div>
                                <button
                                    onClick={() => toggleSection("power")}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                                        openSection === "power" ? "bg-primary/5 text-primary" : "hover:bg-muted/50 text-foreground/80"
                                    )}
                                >
                                    <div className="flex items-center gap-3 font-medium">
                                        <Zap className="w-5 h-5" strokeWidth={1.5} />
                                        By Power
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", openSection === "power" ? "rotate-180" : "")} />
                                </button>

                                <div className={cn(
                                    "grid transition-all duration-300 ease-in-out overflow-hidden",
                                    openSection === "power" ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                                )}>
                                    <div className="min-h-0 pl-11 space-y-1 border-l-2 border-border/10 ml-5 my-1">
                                        {POWER_CATEGORIES.map((power) => (
                                            <Link
                                                key={power.value}
                                                href={`/category/power/${power.value}`}
                                                className="block py-2 px-3 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/30"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {power.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Accordion: By Age */}
                            <div>
                                <button
                                    onClick={() => toggleSection("age")}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                                        openSection === "age" ? "bg-primary/5 text-primary" : "hover:bg-muted/50 text-foreground/80"
                                    )}
                                >
                                    <div className="flex items-center gap-3 font-medium">
                                        <Baby className="w-5 h-5" strokeWidth={1.5} />
                                        By Age
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", openSection === "age" ? "rotate-180" : "")} />
                                </button>

                                <div className={cn(
                                    "grid transition-all duration-300 ease-in-out overflow-hidden",
                                    openSection === "age" ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                                )}>
                                    <div className="min-h-0 pl-11 space-y-1 border-l-2 border-border/10 ml-5 my-1">
                                        {AGE_CATEGORIES.map((age) => (
                                            <Link
                                                key={age.value}
                                                href={`/category/age/${age.value}`}
                                                className="block py-2 px-3 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/30"
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

                    {/* Footer Actions */}
                    <div className="flex-none p-4 border-t border-border/10 bg-muted/20">
                        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-background border border-border/50 hover:border-primary/50 transition-colors shadow-sm group"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Lock className="w-5 h-5 mb-1 text-primary animate-pulse transition-colors" strokeWidth={1.5} />
                                    <span className="text-xs font-bold text-primary">Admin</span>
                                </Link>
                            )}
                            <Link
                                href="/cart"
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-background border border-border/50 hover:border-primary/50 transition-colors shadow-sm group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <ShoppingBag className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                <span className="text-xs font-medium text-muted-foreground">Cart</span>
                            </Link>
                            <Link
                                href="/profile"
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-background border border-border/50 hover:border-primary/50 transition-colors shadow-sm group"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <User className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                <span className="text-xs font-medium text-muted-foreground">Profile</span>
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
            <div className="w-full bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40">
                <div className="flex items-center justify-between px-4 h-12">
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
                                alt="ABC Toyz"
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
                            {cartItemCount > 0 && (
                                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center rounded-full ring-2 ring-background">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            <MobileDrawer />
        </>
    );
}
