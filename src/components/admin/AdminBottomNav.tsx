"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dash', href: '/admin' },
        { icon: Package, label: 'Items', href: '/admin/products' },
        { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
        { icon: Users, label: 'Peeps', href: '/admin/customers' },
        { icon: Settings, label: 'Config', href: '/admin/settings' },
    ];

    return (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-zinc-900/90 backdrop-blur-xl border border-white/10 z-50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-white/40 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "stroke-[3px]" : "stroke-[2px]")} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
