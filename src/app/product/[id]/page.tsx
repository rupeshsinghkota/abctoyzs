import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ImageGallery } from '@/components/product/ImageGallery';
import { StickyCartBar } from '@/components/product/StickyCartBar';
import { Star, Truck, ShieldCheck } from 'lucide-react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductSpecsTable } from '@/components/product/ProductSpecsTable';
import { ProductSchema } from '@/components/product/ProductSchema';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params;

    // In a real app we would fetch by ID directly from DB, but since fetchProducts handles the fallback logic nicely
    // and we might not have a specific fetchProductById optimized yet, we'll fetch all and find.
    // Optimization: Create fetchProduct(id) in data.ts later.
    const products = await fetchProducts();
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    // Fallback images if array is empty (mock data consistency)
    const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

    return (
        <div className="min-h-screen pb-32 md:pb-20 bg-background">
            {/* SEO Structured Data */}
            <ProductSchema product={product} />

            {/* Mobile: Full Screen Gallery / Desktop: Grid */}
            <div className="md:container md:mx-auto md:pt-8 md:grid md:grid-cols-2 md:gap-12">

                {/* Gallery Section */}
                <div className="md:rounded-2xl md:overflow-hidden md:border">
                    <ImageGallery images={productImages} />
                </div>

                {/* Details Section */}
                <div className="px-4 pt-6 md:pt-0">
                    {/* Title & Rating */}
                    <div className="mb-4">
                        {product.tag && (
                            <span className="inline-block px-2 py-1 mb-2 text-xs font-bold text-white bg-black rounded-md uppercase tracking-wider">
                                {product.tag}
                            </span>
                        )}
                        <h1 className="text-2xl md:text-4xl font-black font-heading leading-tight mb-2">{product.name}</h1>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="ml-1 font-bold text-foreground">{product.rating}</span>
                            </div>
                            <span className="text-muted-foreground underline">{product.reviews} Verified Reviews</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6 bg-muted/30 p-4 rounded-xl border border-muted">
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-primary">₹{product.price.toLocaleString()}</span>
                            <span className="text-lg text-muted-foreground line-through">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">20% OFF</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes. Free shipping across India.</p>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 text-xs font-medium whitespace-nowrap">
                            <Truck className="w-4 h-4 text-primary" />
                            <span>Free Delivery</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium whitespace-nowrap">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span>1 Year Warranty</span>
                        </div>
                    </div>

                    {/* Product Specifications Table */}
                    {product.specs && (
                        <div className="mb-10">
                            <h3 className="font-bold text-lg mb-4">Product Specifications</h3>
                            <ProductSpecsTable
                                specs={product.specs}
                                additionalInfo={{
                                    "Voltage": product.voltage,
                                    "Recommended Age": product.ageGroup,
                                    "Category": product.category
                                }}
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-10">
                        <h3 className="font-bold text-lg mb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {product.description || "Experience the thrill of driving with this premium ride-on toy. Designed for safety and fun, it comes equipped with all new features."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-8 border-t pt-8">
                <h2 className="px-4 text-xl font-bold font-heading mb-4 md:container md:mx-auto">You May Also Like</h2>
                <ProductGrid products={products.filter(p => p.id !== product.id).slice(0, 4)} />
            </div>

            {/* Mobile Sticky Bar */}
            <StickyCartBar product={product} />
        </div>
    );
}
