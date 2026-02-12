import { ProductGrid } from '@/components/shop/ProductGrid';
import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ProductFilters } from '@/components/shop/ProductFilters';

export const revalidate = 300;

const PRICE_RANGES = [
    { label: 'Under ₹10,000', value: 'under-10k' },
    { label: '₹10,000 - ₹20,000', value: '10k-20k' },
    { label: 'Above ₹20,000', value: 'above-20k' },
];

interface PriceCategoryPageProps {
    params: Promise<{
        range: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PriceCategoryPageProps): Promise<Metadata> {
    const { range } = await params;
    const rangeInfo = PRICE_RANGES.find(c => c.value === range);
    const title = rangeInfo?.label || range;

    // Use a generic SEO or try to fetch segment if configured (optional)
    return {
        title: `Shop Ride-ons ${title} | ABC Toyz`,
        description: `Explore our collection of electric ride-on cars and bikes ${title}. Best prices and premium quality.`,
    };
}

export default async function PriceCategoryPage({ params, searchParams }: PriceCategoryPageProps) {
    const { range } = await params;
    const resolvedSearchParams = await searchParams;

    const rangeInfo = PRICE_RANGES.find(c => c.value === range);
    if (!rangeInfo) notFound();

    const products = await fetchProducts();

    // Filter based on range
    let filteredProducts = products.filter(p => {
        const price = p.price;
        if (range === 'under-10k') return price < 10000;
        if (range === '10k-20k') return price >= 10000 && price <= 20000;
        if (range === 'above-20k') return price > 20000;
        return false;
    });

    // Apply Additional Filters
    const voltage = resolvedSearchParams.voltage ? (resolvedSearchParams.voltage as string).split(',') : [];
    const age = resolvedSearchParams.age ? (resolvedSearchParams.age as string).split(',') : [];
    const seats = resolvedSearchParams.seats ? (resolvedSearchParams.seats as string).split(',') : [];

    filteredProducts = filteredProducts.filter(p => {
        // Voltage
        if (voltage.length > 0 && (!p.voltage || !voltage.includes(p.voltage))) return false;

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
                    <h1 className="text-xl font-bold font-heading">Budget: {rangeInfo.label}</h1>
                    <p className="text-xs text-muted-foreground">{filteredProducts.length} Products Found</p>
                </div>
                <ProductFilters hiddenFilters={['price']} />
            </div>

            {filteredProducts.length > 0 ? (
                <div className="container mx-auto py-6">
                    <ProductGrid products={filteredProducts} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-lg font-medium text-muted-foreground">No products found in this range with selected filters.</p>
                </div>
            )}
        </div>
    );
}
