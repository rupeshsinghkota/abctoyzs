"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
    const phoneNumber = "918000421913"; // Official business number
    const message = encodeURIComponent("Hi ABC Toyz, I have a question about my order!");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <div className="fixed bottom-28 right-6 md:bottom-10 md:right-10 z-[100] group">
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
                Chat with us
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-zinc-900"></div>
            </div>

            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_8px_40px_rgb(37,211,102,0.6)] transition-all duration-300 active:scale-95"
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />

                {/* Pulse Effect */}
                <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping"></span>
            </a>
        </div>
    );
}
