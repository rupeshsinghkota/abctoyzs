"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, ChevronDown } from "lucide-react";
import { VEHICLE_CATEGORIES, POWER_CATEGORIES, AGE_CATEGORIES } from "@/lib/data";

export function DesktopHeader() {
    return (
        <div className="w-full shadow-sm">
            {/* Top Bar: Logo, Search, Actions */}
            <div className="bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
                <div className="container max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-8">

                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                        <img
                            src="/logo_wide.png"
                            alt="ABC TOYZ"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>

                    {/* Center: Search */}
                    <div className="flex flex-1 max-w-2xl relative group px-8">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search for amazing rides..."
                                className="w-full h-11 pl-11 pr-4 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all duration-300 text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/profile" className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded-full transition-colors text-foreground/70 hover:text-foreground">
                            <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center">
                                <User className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                        </Link>
                        <Link href="/cart" className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded-full transition-colors text-foreground/70 hover:text-foreground group">
                            <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center relative">
                                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full ring-2 ring-background">
                                    0
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="bg-background border-b border-border/40">
                <div className="container max-w-7xl mx-auto px-6 h-12 flex items-center justify-center">
                    <nav className="flex items-center gap-12">
                        {/* View All Option */}
                        <Link
                            href="/category/all"
                            className="text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors py-1 relative group"
                        >
                            View All
                            <span className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center" />
                        </Link>

                        {/* Vehicle Types */}
                        {VEHICLE_CATEGORIES.slice(0, 5).map((cat) => (
                            <Link
                                key={cat.value}
                                href={`/category/${cat.value}`}
                                className="text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors py-1 relative group"
                            >
                                {cat.label}
                                <span className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center" />
                            </Link>
                        ))}

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
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors py-1">
                                By Age <ChevronDown className="w-3 h-3" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-border/50 p-2 min-w-[160px] flex flex-col gap-1">
                                    {AGE_CATEGORIES.map((age) => (
                                        <Link
                                            key={age.value}
                                            href={`/category/age/${age.value}`}
                                            className="px-4 py-2 hover:bg-secondary/50 rounded-lg text-sm text-foreground/80 hover:text-primary transition-colors text-left font-bold"
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
