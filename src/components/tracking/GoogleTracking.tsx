"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
    interface Window {
        gtag: (command: string, ...args: any[]) => void;
    }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-XXXXXXXXX";

export default function GoogleTracking() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && window.gtag) {
            window.gtag("config", GA_ID, {
                page_path: pathname,
            });
            window.gtag("config", ADS_ID);
        }
    }, [pathname, searchParams]);

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
            gtag('config', '${ADS_ID}');
          `,
                }}
            />
        </>
    );
}

// Global helper for event tracking
export const trackEvent = (action: string, category: string, label: string, value?: number) => {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Specifically for Google Ads Conversion
export const trackConversion = (value: number, transaction_id: string) => {
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

    if (typeof window !== "undefined" && window.gtag && adsId && label) {
        window.gtag("event", "conversion", {
            send_to: `${adsId}/${label}`,
            value: value,
            currency: "INR",
            transaction_id: transaction_id,
        });
        console.log(`[Google Ads] Tracking conversion: ${value} INR | ${transaction_id}`);
    }
};
