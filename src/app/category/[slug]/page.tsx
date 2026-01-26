import { ProductGrid } from '@/components/shop/ProductGrid';
import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Ensure params are correctly handled in Next.js 15+ (async params)
export default async function CategoryPage({ params }: CategoryPageProps) {
    // Await params if using newer Next.js versions (though standard type shows interface)
    // In Next 15 params is async.
    const { slug } = await params;

    const allProducts = await fetchProducts();

    // Mock filtering based on slug
    let categoryProducts = allProducts;
    if (slug !== 'new' && slug !== 'all') {
        categoryProducts = allProducts.filter(p => p.category === slug);
    }

    // Capitalize title
    const title = slug.charAt(0).toUpperCase() + slug.slice(1);

    return (
        <div className="min-h-screen pb-20">
            {/* Sticky Header for Category */}
            <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold font-heading">{title} Collection</h1>
                <button className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-sm font-medium hover:bg-muted/80">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {categoryProducts.length > 0 ? (
                <ProductGrid products={categoryProducts} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-lg font-medium text-muted-foreground">No products found for this category.</p>
                </div>
            )}
        </div>
    );
}
