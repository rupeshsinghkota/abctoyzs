"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

// Extend window interface for fbq
declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export default function FacebookPixel() {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!loaded) return;

        // Track pageview on route change
        if (FB_PIXEL_ID) {
            window.fbq('track', 'PageView');
        }
    }, [pathname, searchParams, loaded]);

    if (!FB_PIXEL_ID) {
        console.warn("Facebook Pixel ID is missing in environment variables.");
        return null;
    }

    return (
        <div>
            <Script
                id="fb-pixel"
                src="https://connect.facebook.net/en_US/fbevents.js"
                strategy="afterInteractive"
                onLoad={() => {
                    setLoaded(true);
                    // Initialize logic is in the inline script below, but we set state here
                    // to trigger the useEffect for subsequent navigations if needed?
                    // Actually next/script inline will run first.
                }}
            />
            <Script
                id="fb-pixel-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
                }}
            />
        </div>
    );
}

// Helper to track custom events
export const trackFbEvent = (event: string, data?: any) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', event, data);
    }
};
