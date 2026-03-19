"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();
    const cart = useStore((state) => state.cart);
    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Hide on admin routes or checkout
    if (pathname === '/checkout' || pathname === '/checkout/success' || pathname?.startsWith('/admin')) return null;

    const navItems = [
        {
            label: "Home",
            icon: Home,
            href: "/",
            isActive: pathname === "/"
        },
        {
            label: "Shop",
            icon: Grid,
            href: "/category/all",
            isActive: pathname?.startsWith("/category") || pathname?.startsWith("/shop")
        },
        {
            label: "Cart",
            icon: ShoppingBag,
            href: "/cart",
            isActive: pathname === "/cart",
            badge: cartItemCount
        },
        {
            label: "Profile",
            icon: User,
            href: "/profile",
            isActive: pathname?.startsWith("/profile")
        }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-glass border-t border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-around px-2 h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 group",
                                item.isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <div className={cn(
                                "relative flex items-center justify-center transition-all duration-300",
                                item.isActive ? "translate-y-[-2px]" : ""
                            )}>
                                <Icon className={cn("w-6 h-6 transition-colors", item.isActive ? "fill-primary/20 text-primary" : "text-gray-400 group-hover:text-gray-600")} strokeWidth={item.isActive ? 2.5 : 2} />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white animate-in zoom-in shadow-sm">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold tracking-wide transition-all duration-300",
                                item.isActive ? "opacity-100 text-primary" : "opacity-0 translate-y-2 absolute bottom-1"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
