"use client";

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

export function LiveViewersBadge() {
    const [viewers, setViewers] = useState(12);

    useEffect(() => {
        // Randomize initial viewers between 8 and 25
        setViewers(Math.floor(Math.random() * (25 - 8 + 1)) + 8);

        const interval = setInterval(() => {
            setViewers(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const next = prev + change;
                // keep between 5 and 35
                if (next < 5) return 5;
                if (next > 35) return 35;
                return next;
            });
        }, 3500); // Change every 3.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100 animate-in fade-in slide-in-from-left-2 duration-500">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider">
                <span className="tabular-nums font-bold">{viewers}</span> Parents viewing now
            </span>
        </div>
    );
}
