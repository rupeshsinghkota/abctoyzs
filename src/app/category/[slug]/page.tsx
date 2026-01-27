import { ProductGrid } from '@/components/shop/ProductGrid';
import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;

    const allProducts = await fetchProducts();

    let categoryProducts = allProducts;
    if (slug !== 'new' && slug !== 'all') {
        categoryProducts = allProducts.filter(p => p.category === slug);
    }

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
            <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
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
