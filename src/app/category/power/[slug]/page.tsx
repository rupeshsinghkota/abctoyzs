import { ProductGrid } from '@/components/shop/ProductGrid';
import { fetchProducts, POWER_CATEGORIES } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SettingsService } from '@/lib/services/settings';
import { createClient } from '@/lib/supabase/server';
import { ProductFilters } from '@/components/shop/ProductFilters';

export const revalidate = 300; // Revalidate every 5 minutes

interface PowerCategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

export default async function PowerCategoryPage({ params, searchParams }: PowerCategoryPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    // Validate slug
    const categoryInfo = POWER_CATEGORIES.find(c => c.value === slug);
    if (!categoryInfo) notFound();

    // Fetch and filter products
    const allProducts = await fetchProducts();
    let filteredProducts = allProducts.filter(p => p.voltage?.toLowerCase() === slug.toLowerCase() || p.voltage === categoryInfo.label.split(' ')[0]);

    // Apply Additional Filters
    const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : 0;
    const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : 100000;
    const age = resolvedSearchParams.age ? (resolvedSearchParams.age as string).split(',') : [];
    const seats = resolvedSearchParams.seats ? (resolvedSearchParams.seats as string).split(',') : [];

    filteredProducts = filteredProducts.filter(p => {
        // Price
        if (p.price < minPrice || p.price > maxPrice) return false;

        // Age
        if (age.length > 0 && (!p.ageGroup || !age.includes(p.ageGroup))) return false;

        // Seats
        if (seats.length > 0) {
            const productSeats = p.specs?.seats?.toString();
            if (!productSeats || !seats.includes(productSeats)) return false;
        }

        return true;
    });

    return (
        <div className="min-h-screen pb-20">
            <div className="bg-background border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold font-heading">{categoryInfo.label}</h1>
                    <p className="text-xs text-muted-foreground">{categoryInfo.description}</p>
                </div>
                <ProductFilters hiddenFilters={['voltage']} />
            </div>

            {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-lg font-medium text-muted-foreground">No products found for {categoryInfo.label} with selected filters.</p>
                </div>
            )}
        </div>
    );
}
