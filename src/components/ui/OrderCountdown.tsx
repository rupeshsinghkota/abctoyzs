"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export function OrderCountdown() {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            
            // Dispatch cut-off at 5:00 PM (17:00) IST
            tomorrow.setHours(17, 0, 0, 0);

            if (now >= tomorrow) {
                tomorrow.setDate(now.getDate() + 1);
            }

            const diff = tomorrow.getTime() - now.getTime();
            
            return {
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-orange-600 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 animate-in fade-in duration-700">
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <div className="flex flex-col">
                <span className="uppercase tracking-[0.1em]">Fast Shipping Today</span>
                <span className="text-[11px] md:text-sm font-black text-orange-700 flex items-center gap-1 mt-0.5">
                    Order in 
                    <span className="bg-white px-1.5 py-0.5 rounded border border-orange-200 min-w-[24px] text-center">{timeLeft.hours.toString().padStart(2, '0')}h</span>
                    :
                    <span className="bg-white px-1.5 py-0.5 rounded border border-orange-200 min-w-[24px] text-center">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
                    :
                    <span className="bg-white px-1.5 py-0.5 rounded border border-orange-200 min-w-[24px] text-center">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
                    for Same-Day Dispatch!
                </span>
            </div>
        </div>
    );
}
