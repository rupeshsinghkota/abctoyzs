'use client';

import { useEffect, useRef, useState } from 'react';

interface LazySectionProps {
    children: React.ReactNode;
    className?: string;
    placeholderHeight?: string;
}

export function LazySection({ children, className = '', placeholderHeight = 'h-64' }: LazySectionProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            // Load when 10% visible OR 100px before
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, {
            rootMargin: '200px' // Slightly less eager to ensure scroll triggers it nicely but still smooth
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
            {isVisible ? children : (
                <div className={`w-full ${placeholderHeight} bg-gray-50/50 animate-pulse rounded-2xl`}>
                    <span className="sr-only">Loading section...</span>
                </div>
            )}
        </div>
    );
}
