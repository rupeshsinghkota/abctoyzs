'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto no-scrollbar py-3">
            <Link
                href="/"
                className="flex items-center gap-1 hover:text-primary transition-colors shrink-0"
            >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-1 shrink-0">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-primary transition-colors capitalize"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground font-medium capitalize line-clamp-1">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
