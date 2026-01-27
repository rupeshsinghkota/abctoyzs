import { ProductGrid } from '@/components/shop/ProductGrid';
import { fetchProducts, AGE_CATEGORIES } from '@/lib/data';
import { notFound } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';

interface AgeCategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function AgeCategoryPage({ params }: AgeCategoryPageProps) {
    const { slug } = await params;

    // Validate slug
    const categoryInfo = AGE_CATEGORIES.find(c => c.value === slug);
    if (!categoryInfo) notFound();

    // Fetch and filter products
    const products = await fetchProducts();
    const filteredProducts = products.filter(p => p.ageGroup === slug);

    return (
        <div className="min-h-screen pb-20">
            <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold font-heading">Age: {categoryInfo.label}</h1>
                    <p className="text-xs text-muted-foreground">Ride-ons perfect for this age group</p>
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
