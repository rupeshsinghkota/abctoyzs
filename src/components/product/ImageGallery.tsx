'use client';

import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageGalleryProps {
    images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        });
    }, [emblaApi]);

    return (
        <div className="relative bg-muted/20">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {images.map((src, index) => (
                        <div key={index} className="relative flex-[0_0_100%] min-w-0 aspect-square md:aspect-video">
                            <img
                                src={src}
                                alt={`Product view ${index + 1}`}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            index === selectedIndex ? "bg-primary w-4" : "bg-gray-300"
                        )}
                        onClick={() => emblaApi?.scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    );
}
