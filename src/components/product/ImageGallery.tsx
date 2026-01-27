'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Maximize2, Play, CirclePlay } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    videos?: string[];
}

type MediaItem = {
    type: 'image' | 'video';
    url: string;
};

export function ImageGallery({ images, videos = [] }: ImageGalleryProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [desktopIndex, setDesktopIndex] = useState(0);

    // Combine images and videos into a single list
    const mediaItems = useMemo<MediaItem[]>(() => {
        const items: MediaItem[] = [];
        images.forEach(img => items.push({ type: 'image', url: img }));
        videos.forEach(vid => items.push({ type: 'video', url: vid }));
        return items;
    }, [images, videos]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        });
    }, [emblaApi]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    return (
        <div className="w-full">
            {/* Mobile Carousel (< 768px) */}
            <div className="md:hidden relative bg-gray-50 aspect-square">
                <div className="overflow-hidden h-full" ref={emblaRef}>
                    <div className="flex h-full touch-pan-y">
                        {mediaItems.map((item, index) => (
                            <div
                                key={index}
                                className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-0"
                            >
                                {item.type === 'video' ? (
                                    <video
                                        src={item.url}
                                        controls
                                        className="w-full h-full object-contain bg-black"
                                        poster={images[0]} // Use first image as poster fallback
                                    />
                                ) : (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={item.url}
                                            alt={`Product view ${index + 1}`}
                                            className="w-full h-full object-contain drop-shadow-sm p-8"
                                            draggable={false}
                                        />
                                        {/* Play Button on First Image */}
                                        {index === 0 && videos.length > 0 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    scrollTo(images.length);
                                                }}
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center group hover:bg-black/50 transition-all z-10"
                                            >
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg">
                                                    <Play className="w-6 h-6 text-primary fill-primary" />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mediaItems.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center active:scale-95 transition-transform z-10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center active:scale-95 transition-transform z-10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                            {mediaItems.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollTo(index)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all shadow-sm",
                                        index === selectedIndex
                                            ? "bg-primary w-6"
                                            : "bg-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Desktop Standard Layout (>= 768px) */}
            <div className="hidden md:flex gap-6 h-[500px] lg:h-[600px] w-full">

                {/* Thumbnails Strip */}
                <div className="flex flex-col gap-3 w-24 flex-shrink-0 overflow-y-auto no-scrollbar py-1">
                    {mediaItems.map((item, idx) => (
                        <button
                            key={idx}
                            onMouseEnter={() => item.type === 'image' && setDesktopIndex(idx)}
                            onClick={() => setDesktopIndex(idx)}
                            className={cn(
                                "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-gray-50 flex-shrink-0 group",
                                desktopIndex === idx
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-transparent hover:border-gray-200"
                            )}
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 relative">
                                    <div className="absolute inset-0 bg-black/10 z-0" />
                                    <CirclePlay className="w-8 h-8 text-primary relative z-10 fill-white" />
                                    {/* Optional: Use poster image if available as background */}
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-full h-full object-contain p-1"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Feature View */}
                <div className="relative flex-1 h-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100/50 group">
                    {mediaItems[desktopIndex].type === 'video' ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                            <video
                                src={mediaItems[desktopIndex].url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full h-full">
                                <img
                                    src={mediaItems[desktopIndex].url}
                                    alt="Product Main View"
                                    className="w-full h-full object-contain p-10 transition-transform duration-500 ease-out group-hover:scale-110 cursor-zoom-in"
                                />
                                {/* Play Button on First Image */}
                                {desktopIndex === 0 && videos.length > 0 && (
                                    <button
                                        onClick={() => setDesktopIndex(images.length)}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/20 transition-all z-20"
                                    >
                                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center pl-1 shadow-xl transform group-hover:scale-110 transition-transform">
                                            <Play className="w-7 h-7 text-primary fill-primary" />
                                        </div>
                                        <span className="absolute bottom-[-30px] text-sm font-bold bg-white/90 px-3 py-1 rounded-full shadow-sm text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Watch Video
                                        </span>
                                    </button>
                                )}
                            </div>
                            {/* Zoom Hint */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm">
                                    <Maximize2 className="w-5 h-5 text-gray-700" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

