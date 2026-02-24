"use client";

import { useEffect } from "react";
import { Product } from "@/lib/data";
import { mapToGA4Item, trackEvent } from "./GoogleTracking";

interface Props {
    product: Product;
}

export default function TrackProductView({ product }: Props) {
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Standard Facebook ViewContent Event
            if ((window as any).fbq) {
                (window as any).fbq('track', 'ViewContent', {
                    content_name: product.name,
                    content_ids: [product.id],
                    content_type: 'product',
                    value: product.price,
                    currency: 'INR',
                    content_category: product.category,
                });
            }

            // Standard GA4 view_item Event
            trackEvent("view_item", {
                currency: "INR",
                value: product.price,
                items: [mapToGA4Item(product)]
            });
        }
    }, [product]);

    return null;
}

