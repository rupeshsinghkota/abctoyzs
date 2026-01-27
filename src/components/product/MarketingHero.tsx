'use client';

import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

interface MarketingHeroProps {
    banners?: string[];
}

export function MarketingHero({ banners }: MarketingHeroProps) {
    // If no banners, don't render anything
    if (!banners || banners.length === 0) return null;

    const [emblaRef] = useEmblaCarousel({ loop: true, duration: 60 }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ]);

    return (
        <div className="w-full bg-black relative group overflow-hidden">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {banners.map((banner, index) => (
                        <div key={index} className="flex-[0_0_100%] min-w-0 relative">
                            {/* Desktop: 21:9, Mobile: 4:3 (Centered crop) */}
                            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
                                <img
                                    src={banner}
                                    alt={`Feature Highlight ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay Gradient for text readability if needed */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
                    <span className="text-xs font-bold tracking-wider uppercase">Premium Collection</span>
                </div>
            </div>

            {/* Scroll Indication / CTA (Optical) */}
            <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-10 flex gap-1">
                {banners.map((_, idx) => (
                    <div key={idx} className={cn("h-1 rounded-full transition-all duration-500", "w-8 bg-white/30")} />
                ))}
            </div>
        </div>
    );
}
