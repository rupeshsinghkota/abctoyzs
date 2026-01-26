"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MobileHeader } from "./MobileHeader";
import { DesktopHeader } from "./DesktopHeader";

export function Header() {
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

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

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full flex flex-col transition-transform duration-300 ease-in-out",
                isVisible ? "translate-y-0" : "-translate-y-full"
            )}
        >
            {/* Mobile Header: Hidden on Desktop, Sticky */}
            <div className="md:hidden w-full">
                <MobileHeader />
            </div>

            {/* Desktop Header: Hidden on Mobile, Sticky */}
            <div className="hidden md:block w-full">
                <DesktopHeader />
            </div>
        </header>
    );
}
