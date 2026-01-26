"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User, LayoutGrid, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export function BottomNav() {
    const pathname = usePathname();
    const cart = useStore((state) => state.cart);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/category/all", label: "Shop All", icon: Package },
        { href: "/category", label: "Categories", icon: LayoutGrid },
        { href: "/cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
        { href: "/profile", label: "Profile", icon: User },
    ];

    if (pathname === '/checkout' || pathname === '/checkout/success') return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="relative">
                                <Icon className="w-6 h-6" />
                                {link.badge ? (
                                    <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
