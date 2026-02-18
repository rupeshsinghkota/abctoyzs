"use client";

import { useEffect, useState } from "react";
import { Flame, TrendingUp } from "lucide-react";

interface StockUrgencyProps {
    stock: number | string;
}

export function StockUrgency({ stock }: StockUrgencyProps) {
    const [soldCount, setSoldCount] = useState(3);

    useEffect(() => {
        // Randomize "sold in last hour" count between 3 and 12 for social proof
        setSoldCount(Math.floor(Math.random() * (12 - 3 + 1)) + 3);
    }, []);

    // 1. REAL LOW STOCK WARNING
    if (typeof stock === 'number' && stock > 0 && stock <= 5) {
        return (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg animate-pulse">
                <Flame className="w-4 h-4 fill-red-500" />
                <span>Hurry! Only {stock} units left at this price.</span>
            </div>
        );
    }

    // 2. SOCIAL PROOF (High Demand) - Show if stock is high or unknown
    return (
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
            <TrendingUp className="w-4 h-4" />
            <span>High Demand: {soldCount} sold in the last hour!</span>
        </div>
    );
}
