"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleScroll = useCallback(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Show button after scrolling 400px
        setVisible(scrollTop > 400);

        // Calculate scroll progress (0-100)
        if (docHeight > 0) {
            setProgress(Math.min((scrollTop / docHeight) * 100, 100));
        }
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            {/* Scroll Progress Bar — thin line at very top */}
            <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] bg-transparent pointer-events-none">
                <div
                    className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                aria-label="Back to top"
                className={`
                    fixed z-[99] bottom-24 left-5 md:bottom-10 md:left-10
                    w-10 h-10 md:w-11 md:h-11
                    bg-zinc-900/80 backdrop-blur-sm text-white
                    rounded-full shadow-lg
                    flex items-center justify-center
                    hover:bg-primary hover:scale-110
                    active:scale-95
                    transition-all duration-300
                    ${visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }
                `}
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </>
    );
}
