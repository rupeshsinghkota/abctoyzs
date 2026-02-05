import { ProductGrid } from '@/components/shop/ProductGrid';
import { fetchProducts, POWER_CATEGORIES } from '@/lib/data';
import { notFound } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { Metadata } from 'next';
import { SettingsService } from '@/lib/services/settings';
import { createClient } from '@/lib/supabase/server';

interface PowerCategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PowerCategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const categoryInfo = POWER_CATEGORIES.find(c => c.value === slug.toLowerCase());
    const title = categoryInfo?.label || slug;

    const supabase = await createClient();
    const segment = await SettingsService.getSegmentSEO(`power_${slug}`, supabase);

    return {
        title: segment.defaultTitle || `${title} - High Performance Ride-ons`,
        description: segment.defaultDescription || `Explore our range of ${title} electric ride-on toys. Powerful motors and long-lasting batteries for maximum fun.`,
    };
}

export default async function PowerCategoryPage({ params }: PowerCategoryPageProps) {
    const { slug } = await params;

    // Validate slug
    const categoryInfo = POWER_CATEGORIES.find(c => c.value === slug);
    if (!categoryInfo) notFound();

    // Fetch and filter products
    const products = await fetchProducts();
    const filteredProducts = products.filter(p => p.voltage?.toLowerCase() === slug.toLowerCase() || p.voltage === categoryInfo.label.split(' ')[0]);

    return (
        <div className="min-h-screen pb-20">
            <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold font-heading">{categoryInfo.label}</h1>
                    <p className="text-xs text-muted-foreground">{categoryInfo.description}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-sm font-medium hover:bg-muted/80">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-lg font-medium text-muted-foreground">No products found for {categoryInfo.label}.</p>
                </div>
            )}
        </div>
    );
}
