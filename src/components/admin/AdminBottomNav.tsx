"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dash', href: '/admin' },
        { icon: Package, label: 'Products', href: '/admin/products' },
        { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
        { icon: Users, label: 'Users', href: '/admin/customers' },
        { icon: Home, label: 'Store', href: '/' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
