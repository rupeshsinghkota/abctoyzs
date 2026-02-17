"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, LogOut, LayoutDashboard, ChevronRight, HelpCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function ProfileSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

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

    return (
        <div className="w-full md:w-64 flex-shrink-0">
            {/* Desktop View: Traditional Sidebar */}
            <div className="hidden md:block bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl shadow-zinc-200/50 sticky top-24">
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

            {/* Mobile View: High-Fidelity App Menu */}
            <div className="md:hidden space-y-6">
                <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-2xl shadow-zinc-200/60 transition-transform">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between px-6 py-5 transition-all active:bg-zinc-50 relative",
                                    index !== menuItems.length - 1 && "border-b border-zinc-50",
                                    isActive && "bg-zinc-50/50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-primary/10 text-primary" : "bg-zinc-50 text-zinc-400"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={cn(
                                        "text-[15px] font-black tracking-tight",
                                        isActive ? "text-primary" : "text-zinc-900"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                                <ChevronRight className={cn(
                                    "w-4 h-4 transition-transform",
                                    isActive ? "text-primary translate-x-1" : "text-zinc-300"
                                )} />
                            </Link>
                        );
                    })}
                </div>

                {/* Support & Exit Group */}
                <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-xl shadow-zinc-200/40">
                    <a
                        href="https://wa.me/918239269217"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-6 py-5 transition-all active:bg-zinc-50 border-b border-zinc-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <span className="text-[15px] font-black tracking-tight text-zinc-900">Support & Help</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300" />
                    </a>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-6 py-5 transition-all active:bg-red-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span className="text-[15px] font-black tracking-tight text-red-500">Sign Out</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
