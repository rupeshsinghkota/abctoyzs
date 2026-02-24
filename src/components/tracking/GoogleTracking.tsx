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

// Map internal product to GA4 standard item
export const mapToGA4Item = (item: any) => ({
    item_id: String(item.id || item.product_id),
    item_name: item.name || item.product_name,
    price: item.price,
    quantity: item.quantity || 1,
    item_category: item.category,
    variant: item.attributes ? Object.values(item.attributes).join(' / ') : undefined
});

// Global helper for event tracking
export const trackEvent = (action: string, params: Record<string, any>) => {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", action, params);
        console.log(`[GA4] Event Tracked: ${action}`, params);
    }
};

// Specifically for Google Ads Conversion
export const trackConversion = (value: number, transaction_id: string, items?: any[]) => {
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

    if (typeof window !== "undefined" && window.gtag && adsId && label) {
        // Track GA4 Purchase
        window.gtag("event", "purchase", {
            transaction_id: transaction_id,
            value: value,
            currency: "INR",
            items: items?.map(mapToGA4Item) || []
        });

        // Track Ads Conversion
        window.gtag("event", "conversion", {
            send_to: `${adsId}/${label}`,
            value: value,
            currency: "INR",
            transaction_id: transaction_id,
        });
        console.log(`[Tracking] Purchase & Conversion: ${value} INR | ${transaction_id}`);
    }
};

