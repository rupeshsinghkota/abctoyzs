"use client";

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { WishlistService } from '@/lib/services/wishlist';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface WishlistButtonProps {
    productId: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function WishlistButton({ productId, size = 'md', className }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isActive = true;

        async function checkWishlistStatus() {
            try {
                const status = await WishlistService.isInWishlist(productId);
                if (isActive) setIsWishlisted(status);
            } catch (error: any) {
                // Silently fail if not logged in or network/backend issue
                // Specifically ignore 406 to prevent console noise if that's the issue
                if (error?.status !== 406) {
                    console.debug('Wishlist check silently failed:', error);
                }
            }
        }

        checkWishlistStatus();

        return () => {
            isActive = false;
        };
    }, [productId]);

    async function handleToggle(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        // Check if user is logged in
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login?next=' + encodeURIComponent(window.location.pathname));
            return;
        }

        setLoading(true);
        try {
            const newStatus = await WishlistService.toggleWishlist(productId);
            setIsWishlisted(newStatus);
        } catch (error) {
            console.error('Wishlist toggle failed:', error);
        } finally {
            setLoading(false);
        }
    }

    const sizeClasses = {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
        lg: 'w-11 h-11'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={cn(
                "rounded-full flex items-center justify-center transition-all duration-200",
                "bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md",
                "border border-gray-100",
                sizeClasses[size],
                loading && "opacity-50 pointer-events-none",
                className
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                className={cn(
                    iconSizes[size],
                    "transition-all duration-200",
                    isWishlisted
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-gray-400 hover:text-red-400"
                )}
            />
        </button>
    );
}
