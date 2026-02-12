import { ProductGrid } from '@/components/shop/ProductGrid';
import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Metadata } from 'next';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { SettingsService } from '@/lib/services/settings';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 300; // Revalidate every 5 minutes

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const title = slug.charAt(0).toUpperCase() + slug.slice(1);

    const supabase = await createClient();
    const segment = await SettingsService.getSegmentSEO(`cat_${slug}`, supabase);

    return {
        title: segment.defaultTitle || `${title} Collection`,
        description: segment.defaultDescription || `Explore our premium collection of ${title.toLowerCase()} ride-on toys. Quality, safety, and fun guaranteed for kids in India.`,
        openGraph: {
            title: segment.defaultTitle || `${title} - Premium Ride-ons | abctoyz`,
            description: segment.defaultDescription || `Shop the best ${title.toLowerCase()} for kids. High performance, durable builds, and fast shipping.`,
        }
    };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const allProducts = await fetchProducts();

    let categoryProducts = allProducts;
    if (slug !== 'new' && slug !== 'all') {
        categoryProducts = allProducts.filter(p => p.category === slug);
    }

    // Apply Filters
    const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : 0;
    const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : 100000;
    const voltage = resolvedSearchParams.voltage ? (resolvedSearchParams.voltage as string).split(',') : [];
    const age = resolvedSearchParams.age ? (resolvedSearchParams.age as string).split(',') : [];
    const seats = resolvedSearchParams.seats ? (resolvedSearchParams.seats as string).split(',') : [];

    categoryProducts = categoryProducts.filter(p => {
        // Price
        if (p.price < minPrice || p.price > maxPrice) return false;

        // Voltage
        if (voltage.length > 0 && (!p.voltage || !voltage.includes(p.voltage))) return false;

        // Age
        if (age.length > 0 && (!p.ageGroup || !age.includes(p.ageGroup))) return false;

        // Seats (checking specs.seats)
        if (seats.length > 0) {
            const productSeats = p.specs?.seats?.toString();
            if (!productSeats || !seats.includes(productSeats)) return false;
        }

        return true;
    });

    const title = slug.charAt(0).toUpperCase() + slug.slice(1);

    return (
        <div className="min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 pt-2">
                <Breadcrumb
                    items={[
                        { label: 'Categories', href: '/category' },
                        { label: title }
                    ]}
                />
            </div>

            {/* Category Header */}
            <div className="bg-background border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <h1 className="text-xl font-bold font-heading">{title} Collection</h1>
                <ProductFilters />
            </div>

            {categoryProducts.length > 0 ? (
                <ProductGrid products={categoryProducts} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-lg font-medium text-muted-foreground">No products found for this category with selected filters.</p>
                </div>
            )}
        </div>
    );
}
