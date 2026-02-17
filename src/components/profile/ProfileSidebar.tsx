"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, LogOut, LayoutDashboard, ChevronRight, HelpCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function ProfileSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleToggle = () => setIsDrawerOpen(prev => !prev);
        window.addEventListener('toggle-profile-menu', handleToggle);
        return () => window.removeEventListener('toggle-profile-menu', handleToggle);
    }, []);

    // Close drawer on path change
    useEffect(() => {
        setIsDrawerOpen(false);
    }, [pathname]);

    // Prevent scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isDrawerOpen]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/profile' },
        { icon: Package, label: 'Orders', href: '/orders' },
        { icon: MapPin, label: 'Addresses', href: '/profile/addresses' },
        { icon: User, label: 'Account Details', href: '/profile/details' },
    ];

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Logout error:', error);
        router.refresh();
        router.push('/login');
    };

    const MobileDrawer = () => {
        if (!mounted) return null;

        return createPortal(
            <div className={cn(
                "fixed inset-0 z-[1000] md:hidden transition-all duration-500",
                isDrawerOpen ? "visible" : "invisible"
            )}>
                {/* Backdrop */}
                <div
                    className={cn(
                        "absolute inset-0 bg-zinc-950/60 transition-opacity duration-500",
                        isDrawerOpen ? "opacity-100 backdrop-blur-sm" : "opacity-0"
                    )}
                    onClick={() => setIsDrawerOpen(false)}
                />

                {/* Drawer Content */}
                <div className={cn(
                    "absolute top-0 left-0 bottom-0 z-[1001] w-[85%] max-w-[320px] bg-zinc-50 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col",
                    isDrawerOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* Drawer Header */}
                    <div className="bg-[#0A0A0A] p-8 pb-12 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />

                        <div className="relative z-10 flex items-start justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white border border-white/5 shadow-xl">
                                <User className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mt-4 relative z-10">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Explorer</p>
                            <h2 className="text-xl font-black text-white tracking-tight">Garage Menu</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6 -mt-6 relative z-10 pb-20">
                        <div className="bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-zinc-200/40">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center justify-between px-6 py-4 transition-all active:scale-[0.98] relative",
                                            index !== menuItems.length - 1 && "border-b border-zinc-50",
                                            isActive && "bg-zinc-50/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                                isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-zinc-50 text-zinc-400"
                                            )}>
                                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                                            </div>
                                            <span className={cn(
                                                "text-[14px] font-black tracking-tight",
                                                isActive ? "text-zinc-900" : "text-zinc-500"
                                            )}>
                                                {item.label}
                                            </span>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-3.5 h-3.5 transition-transform",
                                            isActive ? "text-primary translate-x-1" : "text-zinc-300"
                                        )} />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Support & Exit Group: Glassmorphism */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] overflow-hidden shadow-lg shadow-zinc-200/30">
                            <a
                                href="https://wa.me/918239269217"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between px-6 py-4 transition-all active:bg-white/50 border-b border-white/20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center border border-green-500/10">
                                        <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[14px] font-black tracking-tight text-zinc-900">Support</span>
                                </div>
                            </a>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between px-6 py-4 transition-all active:bg-red-50/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10">
                                        <LogOut className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[14px] font-black tracking-tight text-red-500">Sign Out</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="p-8 text-center border-t border-zinc-100 bg-white mt-auto">
                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Abc Toyz Garage v2.0</p>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <>
            {/* Desktop View: Traditional Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0 sticky top-24">
                <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl shadow-zinc-200/50">
                    <div className="flex items-center gap-4 mb-8 px-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em]">Hello,</p>
                            <p className="font-black text-zinc-900">Customer</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all",
                                        isActive
                                            ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 active:scale-[0.98]"
                                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-black tracking-tight">{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="pt-4 mt-6 border-t border-zinc-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all text-left group"
                            >
                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-black tracking-tight">Log Out</span>
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            <MobileDrawer />
        </>
    );
}
