import { ProductGrid } from '@/components/shop/ProductGrid';
import { fetchProducts, AGE_CATEGORIES } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SettingsService } from '@/lib/services/settings';
import { createClient } from '@/lib/supabase/server';
import { ProductFilters } from '@/components/shop/ProductFilters';

export const revalidate = 300; // Revalidate every 5 minutes

interface AgeCategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: AgeCategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const categoryInfo = AGE_CATEGORIES.find(c => c.value === slug);
    const title = categoryInfo?.label || slug;

    const supabase = await createClient();
    const segment = await SettingsService.getSegmentSEO(`age_${slug}`, supabase);

    return {
        title: segment.defaultTitle || `Ride-on Toys for ${title} Years`,
        description: segment.defaultDescription || `Find the perfect electric cars and bikes for children aged ${title}. Safely engineered for their development stage.`,
    };
}

export default async function AgeCategoryPage({ params, searchParams }: AgeCategoryPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    // Validate slug
    const categoryInfo = AGE_CATEGORIES.find(c => c.value === slug);
    if (!categoryInfo) notFound();

    // Fetch and filter products
    const allProducts = await fetchProducts();
    let filteredProducts = allProducts.filter(p => p.ageGroup === slug);

    // Apply Additional Filters (Price, Voltage, Seats)
    const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : 0;
    const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : 100000;
    const voltage = resolvedSearchParams.voltage ? (resolvedSearchParams.voltage as string).split(',') : [];
    const seats = resolvedSearchParams.seats ? (resolvedSearchParams.seats as string).split(',') : [];

    filteredProducts = filteredProducts.filter(p => {
        // Price
        if (p.price < minPrice || p.price > maxPrice) return false;

        // Voltage
        if (voltage.length > 0 && (!p.voltage || !voltage.includes(p.voltage))) return false;

        // Seats (checking specs.seats)
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
                    <h1 className="text-xl font-bold font-heading">Age: {categoryInfo.label}</h1>
                    <p className="text-xs text-muted-foreground">Ride-ons perfect for this age group</p>
                </div>
                <ProductFilters hiddenFilters={['age']} />
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
