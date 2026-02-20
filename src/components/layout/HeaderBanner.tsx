"use client";
import { X, Copy, Check, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function HeaderBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [currentMessage, setCurrentMessage] = useState(0);
    const [copied, setCopied] = useState(false);

    const messages = [
        {
            text: "Free Delivery on all orders over ₹2000",
            icon: <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        },
        {
            text: "Get 5% OFF on Prepaid Orders!",
            code: "PREPAID5",
            icon: <Ticket className="w-3.5 h-3.5" />
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText("PREPAID5");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isVisible) return null;

    return (
        <div className="relative w-full bg-zinc-900 overflow-hidden border-b border-white/5">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 animate-gradient-x" />

            <div className="container max-w-7xl mx-auto px-4 h-10 flex items-center justify-center relative">
                <div className="flex items-center gap-3 transition-all duration-500 transform">
                    {messages[currentMessage].icon}
                    <p className="text-[10px] md:text-[11px] font-bold text-white tracking-widest uppercase flex items-center gap-2">
                        {messages[currentMessage].text}
                        {messages[currentMessage].code && (
                            <span className="flex items-center gap-2 ml-1">
                                <span className="bg-white/20 px-2 py-0.5 rounded border border-white/10 text-primary uppercase font-black text-xs">
                                    {messages[currentMessage].code}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="p-1 hover:bg-white/10 rounded-md transition-all active:scale-95"
                                    title="Copy Code"
                                >
                                    {copied ? (
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5 text-white/70" />
                                    )}
                                </button>
                            </span>
                        )}
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 p-1 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
