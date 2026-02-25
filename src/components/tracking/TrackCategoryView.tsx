"use client";

import { useEffect } from "react";
import { trackFbEvent } from "./FacebookPixel";

interface Props {
    categoryName: string;
}

export default function TrackCategoryView({ categoryName }: Props) {
    useEffect(() => {
        trackFbEvent('ViewCategory', {
            content_category: categoryName,
        });
    }, [categoryName]);

    return null;
}
