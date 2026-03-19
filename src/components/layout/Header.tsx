"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MobileHeader } from "./MobileHeader";
import { DesktopHeader } from "./DesktopHeader";
import { HeaderBanner } from "./HeaderBanner";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (currentScrollY / scrollHeight) * 100;
            setScrollProgress(progress);

            // Always show at the very top (buffer of 10px)
            if (currentScrollY < 10) {
                setIsVisible(true);
            } else {
                // Show if scrolling UP, Hide if scrolling DOWN
                // We add a small threshold to avoid jitter
                if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
                    if (currentScrollY > lastScrollY.current) {
                        setIsVisible(false); // Scrolling DOWN
                    } else {
                        setIsVisible(true);  // Scrolling UP
                    }
                }
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) return null;

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full flex flex-col transition-all duration-300 ease-in-out",
                isVisible ? "translate-y-0" : "-translate-y-full"
            )}
        >
            <HeaderBanner />

            <div className="w-full relative bg-glass border-b border-white/10 shadow-sm">
                {/* Mobile Header: Hidden on Desktop */}
                <div className="md:hidden w-full">
                    <MobileHeader />
                </div>

                {/* Desktop Header: Hidden on Mobile */}
                <div className="hidden md:block w-full">
                    <DesktopHeader />
                </div>

                {/* Scroll Progress Bar */}
                <div
                    className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-150 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>
        </header>
    );
}
