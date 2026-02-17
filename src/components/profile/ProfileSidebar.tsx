"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, LogOut, LayoutDashboard } from 'lucide-react';
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
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    return (
        <div className="w-full md:w-64 flex-shrink-0">
            {/* Desktop Version */}
            <div className="hidden md:block bg-card border rounded-2xl p-4 sticky top-24 shadow-sm">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-[0.1em]">Hello,</p>
                        <p className="font-black text-sm">Customer</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 scale-[1.02]'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all text-left group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold tracking-tight">Log Out</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Version: Horizontal Scrollable Nav */}
            <div className="md:hidden mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <User className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-zinc-900">Account Control</h2>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Log Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all text-sm font-black border",
                                    isActive
                                        ? "bg-zinc-900 text-white border-zinc-900 shadow-xl"
                                        : "bg-white text-zinc-500 border-zinc-100 shadow-sm"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
