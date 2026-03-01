"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu, X, LayoutDashboard, Package, ShoppingCart,
    Users, Globe, Mail, Ticket, Settings, Home, LogOut,
    Video, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminMobileMenu({ navItems }: { navItems: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const ICON_MAP = {
        LayoutDashboard,
        MessageSquare,
        Package,
        Ticket,
        ShoppingCart,
        Video,
        Users,
        Mail,
        Globe,
        Settings
    };

    return (
        <>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-over Sidebar */}
            <div className={cn(
                "fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[110] md:hidden transition-transform duration-300 ease-in-out border-r shadow-2xl flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b flex justify-between items-center bg-zinc-50/50">
                    <div>
                        <img src="/logo_wide.png" alt="ABC Toyz" className="h-6" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Admin Panel</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white rounded-xl border shadow-sm transition-all text-zinc-400 hover:text-zinc-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP] || LayoutDashboard;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "hover:bg-zinc-100 text-zinc-600"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-400 group-hover:text-primary")} />
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-zinc-100">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-all font-bold text-sm"
                        >
                            <Home className="w-5 h-5 text-zinc-400" />
                            Storefront
                        </Link>
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-all font-bold text-sm mt-1"
                            >
                                <LogOut className="w-5 h-5 text-red-400" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </nav>

                <div className="p-4 bg-zinc-50 border-t">
                    <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-widest">
                        v2.4.0 • Enterprise Edition
                    </p>
                </div>
            </div>
        </>
    );
}
