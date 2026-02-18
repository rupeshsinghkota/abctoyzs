"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, ChevronDown, Lock } from "lucide-react";
import { VEHICLE_CATEGORIES, POWER_CATEGORIES, AGE_CATEGORIES } from "@/lib/data";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

import { useStore } from "@/store/useStore";

export function DesktopHeader() {
    const { isAdmin } = useAdmin();
    const cart = useStore((state) => state.cart);
    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="w-full shadow-sm">
            {/* Top Bar: Logo, Search, Actions */}
            <div className="border-b border-border/10">
                <div className="container max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between gap-12">

                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center transition-all duration-300 hover:scale-105 active:scale-95 shrink-0">
                        <img
                            src="/logo_wide.png"
                            alt="ABC Toyz"
                            className="h-9 w-auto object-contain"
                        />
                    </Link>

                    {/* Center: Search */}
                    <div className="flex-1 max-w-xl group relative">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                            <input
                                type="text"
                                placeholder="Search premium ride-ons..."
                                className="w-full h-11 pl-11 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all duration-500 text-sm focus:outline-none placeholder:text-muted-foreground/60"
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <Link href="/admin" className="p-2.5 hover:bg-primary/5 rounded-xl transition-all duration-300 text-muted-foreground hover:text-primary active:scale-95" title="Admin Dashboard">
                                <Lock className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                        )}
                        <Link href="/profile" className="p-2.5 hover:bg-secondary/50 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground active:scale-95">
                            <User className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <Link href="/cart" className="relative p-2.5 hover:bg-secondary/50 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground active:scale-95">
                            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                            {cartItemCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full ring-2 ring-background animate-in zoom-in">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="">
                <div className="container max-w-7xl mx-auto px-6 h-[44px] flex items-center justify-center">
                    <nav className="flex items-center gap-10">
                        {/* View All Option */}
                        <NavLink href="/category/all">
                            View All
                        </NavLink>

                        {/* Vehicle Types */}
                        {VEHICLE_CATEGORIES.slice(0, 7).map((cat) => (
                            <NavLink key={cat.value} href={`/category/${cat.value}`}>
                                {cat.label}
                            </NavLink>
                        ))}

                        <NavLink href="/track-order" isPrimary>
                            Track Order
                        </NavLink>

                        {/* Power Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors py-1">
                                By Power <ChevronDown className="w-3 h-3" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-border/50 p-2 min-w-[200px] flex flex-col gap-1">
                                    {POWER_CATEGORIES.map((power) => (
                                        <Link
                                            key={power.value}
                                            href={`/category/power/${power.value}`}
                                            className="px-4 py-2 hover:bg-secondary/50 rounded-lg text-sm text-foreground/80 hover:text-primary transition-colors text-left"
                                        >
                                            <span className="font-bold block">{power.label}</span>
                                            <span className="text-[10px] text-muted-foreground font-normal">{power.description}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Age Dropdown */}
                        <div className="relative group/menu">
                            <button className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/50 hover:text-primary transition-colors py-2">
                                By Age <ChevronDown className="w-3 h-3 transition-transform group-hover/menu:rotate-180" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50 translate-y-2 group-hover/menu:translate-y-0">
                                <div className="bg-background rounded-2xl shadow-2xl border border-border/10 p-2 min-w-[160px] flex flex-col gap-1 backdrop-blur-xl">
                                    {AGE_CATEGORIES.map((age) => (
                                        <Link
                                            key={age.value}
                                            href={`/category/age/${age.value}`}
                                            className="px-4 py-2.5 hover:bg-primary/5 rounded-xl text-xs text-foreground/70 hover:text-primary transition-colors text-left font-bold"
                                        >
                                            {age.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    );
}

function NavLink({ href, children, isPrimary = false }: { href: string; children: React.ReactNode; isPrimary?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 py-2 relative group",
                isPrimary ? "text-primary hover:text-primary/80" : "text-foreground/50 hover:text-primary"
            )}
        >
            {children}
            <span className="absolute bottom-1 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left rounded-full" />
        </Link>
    );
}

