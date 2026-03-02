'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Link from 'next/link';

const slides = [
    {
        id: 1,
        title: "Premium Electric Cars",
        subtitle: "Officially Licensed BMW, Audi & More",
        image: "/hero/hero_car_1769365166894.webp",
        cta: "Shop Now",
        link: "/category/cars",
        color: "bg-blue-600"
    },
    {
        id: 2,
        title: "Off-Road Jeeps",
        subtitle: "For the Little Adventurers",
        image: "/hero/hero_jeep_1769365183790.webp",
        cta: "Explore",
        link: "/category/jeeps",
        color: "bg-orange-600"
    },
    {
        id: 3,
        title: "Super Bikes",
        subtitle: "Speed & Style Combined",
        image: "/hero/hero_bike_1769365200981.webp",
        cta: "Ride On",
        link: "/category/bikes",
        color: "bg-red-600"
    }
];

export function HeroSlider() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    // ... existing hooks and useEffect ...

    const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = React.useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    React.useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative overflow-hidden bg-muted/20 group" ref={emblaRef}>
            <div className="flex touch-pan-y">
                {slides.map((slide) => (
                    <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 aspect-[3/2] sm:aspect-[16/9] md:aspect-[21/9]">
                        {/* ... existing Image ... */}
                        <div className="absolute inset-0 w-full h-full">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                sizes="100vw"
                                priority={slide.id === 1}
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </div>

                        {/* Content Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 text-white pb-8 md:pb-24 flex flex-col items-start justify-end h-full">
                            <span className={cn("inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-1 md:mb-4 backdrop-blur-md bg-white/25 border border-white/30 shadow-sm")}>
                                New Arrival
                            </span>
                            <h2 className="text-2xl md:text-6xl font-black mb-1 md:mb-2 drop-shadow-xl leading-tight tracking-tight">{slide.title}</h2>
                            <p className="text-white/90 text-xs md:text-xl mb-3 md:mb-6 max-w-lg leading-snug drop-shadow-md font-medium">{slide.subtitle}</p>
                            <Link
                                href={slide.link}
                                className={cn("inline-block px-5 py-1.5 md:px-8 md:py-3 rounded-full font-bold text-xs md:text-lg transition-transform active:scale-95 text-center text-white shadow-lg shadow-black/20", slide.color)}
                            >
                                {slide.cta}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            {/* ... remaining structure ... */}

            {/* Navigation Arrows (Desktop Only) */}
            <button
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                onClick={scrollPrev}
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                onClick={scrollNext}
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            index === selectedIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                        )}
                        onClick={() => scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    );
}
