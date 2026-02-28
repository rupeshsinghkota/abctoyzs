"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIVITIES = [
    { name: "Rahul", city: "Delhi", product: "Thar Bumper 4x4", time: "2 minutes ago" },
    { name: "Siddharth", city: "Mumbai", product: "BMW S1000RR Ride-on", time: "5 minutes ago" },
    { name: "Ananya", city: "Bangalore", product: "Audi e-tron Sportback", time: "12 minutes ago" },
    { name: "Vikram", city: "Hyderabad", product: "Mercedes G63 AMG", time: "8 minutes ago" },
    { name: "Ishaan", city: "Ahmedabad", product: "Ninja Superbike", time: "15 minutes ago" },
    { name: "Meera", city: "Chennai", product: "Range Rover HSE", time: "3 minutes ago" },
    { name: "Arjun", city: "Pune", product: "Ducati Panigale V4", time: "20 minutes ago" },
    { name: "Zara", city: "Jaipur", product: "Vintage Classic Car", time: "10 minutes ago" },
];

export function RecentActivityToast() {
    const pathname = usePathname();
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenShown, setHasBeenShown] = useState(false);

    // Hide on cart, checkout, and admin pages
    const isHiddenPage = pathname?.startsWith('/cart') || pathname?.startsWith('/checkout') || pathname?.startsWith('/admin');

    useEffect(() => {
        // Initial delay before first show
        const initialTimer = setTimeout(() => {
            setIsVisible(true);
            setHasBeenShown(true);
        }, 10000); // Show after 10 seconds

        const cycleActivity = () => {
            setIsVisible(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % ACTIVITIES.length);
                setIsVisible(true);
            }, 1000); // Delay between hide and show next
        };

        // Set up interval for subsequent activities
        const interval = setInterval(() => {
            cycleActivity();
        }, 25000); // Every 25 seconds

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    if (isHiddenPage) return null;
    if (!hasBeenShown) return null;

    const activity = ACTIVITIES[index];

    return (
        <div
            className={cn(
                "fixed left-4 md:left-8 z-40 transition-all duration-700 ease-in-out transform",
                // Mobile: above BottomNav (h-16 + padding), Desktop: bottom part of screen
                "bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8",
                isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-90 pointer-events-none"
            )}
        >
            <div className="bg-white/95 backdrop-blur-md border border-zinc-100 shadow-2xl shadow-zinc-200/50 rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 max-w-[280px] md:max-w-xs ring-1 ring-black/[0.02]">
                <div className="relative shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[11px] md:text-xs font-bold text-zinc-900 leading-tight">
                        {activity.name} from <span className="text-primary">{activity.city}</span>
                    </p>
                    <p className="text-[10px] md:text-sm text-zinc-500 truncate mt-0.5">
                        Purchased {activity.product}
                    </p>
                    <p className="text-[9px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">
                        {activity.time}
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="shrink-0 p-1 hover:bg-zinc-100 rounded-full transition-colors self-start -mt-1 -mr-1"
                >
                    <X className="w-3.5 h-3.5 text-zinc-300" />
                </button>
            </div>
        </div>
    );
}
