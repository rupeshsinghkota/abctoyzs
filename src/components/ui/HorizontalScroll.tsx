'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HorizontalScrollProps {
    children: React.ReactNode;
    className?: string;
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 10); // buffer
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const { clientWidth } = scrollRef.current;
        const scrollAmount = clientWidth * 0.8;

        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <div className="relative group">
            {/* Left Button */}
            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-zinc-100 flex items-center justify-center text-zinc-800 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className={cn(
                    "flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory",
                    className
                )}
            >
                {children}
            </div>

            {/* Right Button */}
            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-zinc-100 flex items-center justify-center text-zinc-800 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
