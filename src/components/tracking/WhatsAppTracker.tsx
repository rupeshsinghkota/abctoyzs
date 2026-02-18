"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function WhatsAppTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // 0. Check for INBOUND traffic from WhatsApp (e.g. ?utm_source=whatsapp)
        const source = searchParams.get('utm_source');
        if (source && source.toLowerCase().includes('whatsapp')) {
            localStorage.setItem('hasEngagedWhatsApp', 'true');
            sessionStorage.setItem("hasSeenPromoPopup", "true");
        }

        // 1. Function to handle global clicks (OUTBOUND)
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Traverse up to find generic anchor tag locally
            const link = target.closest('a');

            if (link) {
                const href = link.getAttribute('href');
                if (href && (href.includes('wa.me') || href.includes('api.whatsapp.com'))) {
                    // User clicked a WhatsApp link -> Mark as engaged
                    localStorage.setItem('hasEngagedWhatsApp', 'true');

                    // Also mark in session storage for immediate popup suppression if needed
                    sessionStorage.setItem("hasSeenPromoPopup", "true");
                }
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [pathname]);

    return null; // Renderless component
}
