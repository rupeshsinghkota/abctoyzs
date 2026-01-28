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
            {/* Mobile Carousel (< 768px) - Optimized 1:1 Aspect Ratio */}
            <div className="md:hidden relative bg-white aspect-square w-full">
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
                                            className="w-full h-full object-contain drop-shadow-sm p-0"
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
            <div className="hidden md:flex gap-6 h-[calc(100vh-180px)] min-h-[600px] max-h-[850px] w-full">

                {/* Thumbnails Strip - Floating Style */}
                <div className="flex flex-col gap-4 w-[100px] flex-shrink-0 overflow-y-auto no-scrollbar py-2 h-full pr-2">
                    {mediaItems.map((item, idx) => (
                        <button
                            key={idx}
                            onMouseEnter={() => item.type === 'image' && setDesktopIndex(idx)}
                            onClick={() => setDesktopIndex(idx)}
                            className={cn(
                                "relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 flex-shrink-0 group",
                                desktopIndex === idx
                                    ? "ring-2 ring-black dark:ring-white ring-offset-4 scale-105 shadow-lg"
                                    : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0 hover:scale-105"
                            )}
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 relative">
                                    <div className="absolute inset-0 bg-black/5 z-0" />
                                    <CirclePlay className="w-8 h-8 text-primary relative z-10 fill-white/80" />
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-full h-full object-contain bg-white transition-transform duration-500 group-hover:scale-110"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Feature View - Immersive */}
                <div className="relative flex-1 h-full bg-white rounded-[40px] overflow-hidden group border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                    {mediaItems[desktopIndex].type === 'video' ? (
                        <div className="w-full h-full bg-black flex items-center justify-center rounded-[40px] overflow-hidden">
                            <video
                                src={mediaItems[desktopIndex].url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                {/* Subtle Background Blur for Depth */}
                                <div
                                    className="absolute inset-0 opacity-10 blur-3xl scale-150 transition-all duration-1000"
                                    style={{ backgroundImage: `url(${mediaItems[desktopIndex].url})`, backgroundSize: 'cover' }}
                                />

                                <img
                                    src={mediaItems[desktopIndex].url}
                                    alt="Product Main View"
                                    className="w-full h-full object-contain p-8 transition-all duration-1000 ease-out group-hover:scale-105 relative z-10"
                                />


                                {/* Fullscreen / Zoom Hint */}
                                <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-black/5 backdrop-blur-md rounded-full border border-black/5">
                                        <Maximize2 className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Showroom View</span>
                                    </div>
                                </div>

                                {/* Play Button for Video variant link */}
                                {desktopIndex === 0 && videos.length > 0 && (
                                    <button
                                        onClick={() => setDesktopIndex(images.length)}
                                        className="absolute bottom-8 right-8 w-16 h-16 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 shadow-2xl border border-white transition-all z-20"
                                    >
                                        <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

