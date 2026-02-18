"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function HeaderBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative w-full bg-primary overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary animate-gradient-x opacity-50" />

            <div className="container max-w-7xl mx-auto px-4 h-9 flex items-center justify-center relative">
                <p className="text-[11px] md:text-xs font-bold text-primary-foreground tracking-wider uppercase flex items-center gap-2">
                    <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Free Delivery on all orders over ₹2000
                    <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </p>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 p-1 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
