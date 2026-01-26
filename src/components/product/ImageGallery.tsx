'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ZoomIn, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        });
    }, [emblaApi]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    return (
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
            {/* Main Carousel */}
            <div
                className="overflow-hidden cursor-zoom-in"
                ref={emblaRef}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <div className="flex touch-pan-y">
                    {images.map((src, index) => (
                        <div
                            key={index}
                            className="relative flex-[0_0_100%] min-w-0 aspect-square overflow-hidden"
                        >
                            <div
                                className="w-full h-full transition-transform duration-300"
                                style={{
                                    transform: isZoomed && selectedIndex === index ? 'scale(1.5)' : 'scale(1)',
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                                }}
                            >
                                <img
                                    src={src}
                                    alt={`Product view ${index + 1}`}
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Zoom Indicator */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full flex items-center gap-2 text-white text-xs font-medium">
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Hover to zoom</span>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={scrollPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform text-foreground"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform text-foreground"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                {selectedIndex + 1} / {images.length}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent">
                    <div className="flex justify-center gap-2.5">
                        {images.map((src, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={cn(
                                    "relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 shadow-lg",
                                    index === selectedIndex
                                        ? "border-white scale-110 ring-2 ring-primary ring-offset-2 ring-offset-black/50"
                                        : "border-white/30 opacity-70 hover:opacity-100 hover:border-white/70 hover:scale-105"
                                )}
                            >
                                <img
                                    src={src}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {index === selectedIndex && (
                                    <div className="absolute inset-0 bg-primary/20" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Single Image Indicator (no thumbnails needed) */}
            {images.length === 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                        Premium Quality • Authentic Product
                    </div>
                </div>
            )}
        </div>
    );
}
