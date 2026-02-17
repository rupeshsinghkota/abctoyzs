'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        // Instant scroll to top on path change
        window.scrollTo(0, 0);

        // Also try to scroll main element if it exists (for some layouts)
        const main = document.querySelector('main');
        if (main) main.scrollTo(0, 0);

    }, [pathname]);

    return null;
}
