"use client";

import { useEffect } from "react";
import { Product } from "@/lib/data";

interface Props {
    product: Product;
}

export default function TrackProductView({ product }: Props) {
    useEffect(() => {
        if (typeof window !== "undefined" && window.fbq) {
            // Standard Facebook ViewContent Event
            window.fbq('track', 'ViewContent', {
                content_name: product.name,
                content_ids: [product.id],
                content_type: 'product',
                value: product.price,
                currency: 'INR',
                content_category: product.category,
            });
        }
    }, [product]);

    return null;
}
