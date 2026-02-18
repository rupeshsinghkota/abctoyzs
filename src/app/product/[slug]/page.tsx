import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Share2, Heart, ShoppingBag, Gauge, Package, ArrowRight, Wallet, ShieldCheck, Zap, Medal, Star, Weight, Gamepad2, CheckCircle2, Truck, Baby } from 'lucide-react';

import { ProductSpecs } from '@/components/product/ProductSpecs';
import { ProductSchema } from '@/components/product/ProductSchema';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import Link from 'next/link';
import { ProductMainSection } from '@/components/product/ProductMainSection';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductCard } from '@/components/shop/ProductCard';
import { Metadata } from 'next';
import { MarketingHero } from '@/components/product/MarketingHero';
import TrackProductView from '@/components/tracking/TrackProductView';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const products = await fetchProducts(slug);
    const product = products.length > 0 ? products[0] : null;

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const title = product.meta_title || `${product.name} - Premium Ride-on Toys`;
    const description = product.meta_description || product.description?.replace(/<[^>]*>/g, '').slice(0, 160);

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        },
    };
}

// Force dynamic rendering to ensure fresh data on every request (fixes localhost 404s due to caching)
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;

    // Use fetchProducts(slug) which uses the Client SDK logic (createBrowserClient).
    // This was verified to work via the /api/debug/products endpoint.
    // We avoid createServerClient() here as it seemed to cause 404s locally (likely auth/cookie context mismatch).
    const products = await fetchProducts(slug);

    console.log(`[ProductPage] Loading slug: ${slug} | Found: ${products.length} `);

    if (products.length === 0) {
        console.warn(`[ProductPage] WARN: Product NOT found via fetchProducts(slug).attempting fallback fetch all...`);
        // Fallback: Fetch ALL and filter (in case exact database slug match is erratic locally)
        const all = await fetchProducts();
        const found = all.find(p => p.slug === slug);
        if (found) {
            console.log(`[ProductPage] FOUND via fallback filter!`);
            products.push(found);
        } else {
            console.log(`[ProductPage] NOT FOUND via fallback either.`);
        }
    }

    const product = products.length > 0 ? products[0] : null;

    if (!product) {
        console.error(`[ProductPage] Error: Product not found for slug: ${slug} `);
        notFound();
    }



    // Get related products (same category, excluding current)
    // Get related products with Smart Fallback
    // Ideally we should have a specific API for this to avoid fetching ALL products, 
    // but since we are caching the page, this impact is minimized.
    const allProducts = await fetchProducts();

    // 1. Primary Strategy: Same Category
    let relatedProducts = allProducts
        .filter(p => p.id !== product.id && p.category === product.category);

    // 2. Fallback Strategy: Fill with Best Sellers / Popular if we have fewer than 4 items
    if (relatedProducts.length < 4) {
        const needed = 4 - relatedProducts.length;
        const fallbackItems = allProducts
            .filter(p =>
                p.id !== product.id && // Not current product
                p.category !== product.category && // Not already in list (different cat)
                (p.tag === 'Best Seller' || p.rating >= 4.5) // Prioritize popular
            )
            .slice(0, needed + 2); // Fetch a few extras just in case

        relatedProducts = [...relatedProducts, ...fallbackItems];

        // 3. Final Fallback: If still under 4, just grab any other products
        if (relatedProducts.length < 4) {
            const stillNeeded = 4 - relatedProducts.length;
            const remaining = allProducts
                .filter(p =>
                    p.id !== product.id &&
                    !relatedProducts.find(rp => rp.id === p.id)
                )
                .slice(0, stillNeeded);
            relatedProducts = [...relatedProducts, ...remaining];
        }
    }

    // Limit to 6 items max for display
    relatedProducts = relatedProducts.slice(0, 6);


    // Feature highlights
    const highlights = [
        { icon: Baby, label: 'Age', value: product.specs?.suitable_age || (product.ageGroup ? `${product.ageGroup} Yrs` : null) },
        { icon: Gauge, label: 'Speed', value: product.specs?.speed },
        { icon: Weight, label: 'Load', value: product.specs?.max_load },
        { icon: Gamepad2, label: 'Control', value: product.specs?.mobile_app ? 'App & Remote' : (product.specs?.remote_control ? 'Remote' : 'Manual') },
    ].filter(h => h.value);

    // ... (previous code)
    const whatsInBox = product.box_content || [];




    return (
        <div className="min-h-screen bg-background md:pb-0">
            {/* ... (schema and breadcrumb unchanged) */}
            <ProductSchema product={product} />
            <TrackProductView product={product} />

            <div className="container mx-auto px-4 py-2 md:py-6 overflow-hidden">
                <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
                    <Link href="/" className="hover:text-primary transition-colors shrink-0">
                        <Home className="w-3.5 h-3.5" />
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-border shrink-0" />
                    <Link href={`/category/${product.category}`} className="hover:text-primary transition-colors capitalize font-medium shrink-0">
                        {product.category}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-border shrink-0" />
                    <span className="text-foreground font-semibold shrink-0">{product.name}</span>
                </nav>
            </div>

            {/* Main Section - Wider Container for Premium Feel */}
            <main className="container max-w-[1800px] mx-auto px-0 md:px-6 lg:px-8">
                <ProductMainSection product={product} boxContent={whatsInBox} />

                {/* DESKTOP FULL WIDTH DETAILS (Below Fold) */}
                <div className="hidden lg:block mt-12 max-w-7xl mx-auto space-y-16 px-4 pb-16">


                    {/* 2. Specs & Box Contents (Optimized Compact Layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 items-start px-4 md:px-0">

                        {/* Specs Card */}
                        <div className="relative group/specs bg-white p-6 lg:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] h-full overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 opacity-50 transition-opacity" />

                            <div className="relative flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                                        <Gauge className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Technical Specs</h3>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[9px] font-black uppercase tracking-wider text-blue-600">
                                    Verified
                                </span>
                            </div>

                            <ProductSpecs
                                specs={product.specs}
                                additionalInfo={{
                                    "Voltage": product.voltage,
                                    "Recommended Age": product.ageGroup,
                                    "Category": product.category?.charAt(0).toUpperCase() + product.category?.slice(1),
                                    "Safety": "BIS Safety Standard Approved"
                                }}
                            />
                        </div>

                        {/* Box Contents Card */}
                        <div className="relative group/box bg-white p-6 lg:p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] h-full overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/5">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -mr-24 -mt-24 opacity-50 transition-opacity" />

                            <div className="relative flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-inner">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Inside the Box</h3>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[9px] font-black uppercase tracking-wider text-orange-600">
                                    {whatsInBox.length} Items
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
                                {whatsInBox.map((item: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-transparent hover:border-orange-100 hover:bg-white transition-all duration-300 group/item">
                                        <div className="w-5 h-5 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 group-hover/item:border-orange-500 transition-all">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-green-600 group-hover/item:text-orange-500 transition-colors" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 group-hover/item:text-gray-900 truncate leading-none transition-colors">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Product Description — Full Width */}
                    {product.description && (
                        <div>
                            {/* Section Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Product Description</h3>
                                    <p className="text-sm text-gray-400 mt-0.5">Everything you need to know</p>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-4" />
                            </div>

                            {/* Description Content */}
                            <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-8 lg:p-10">
                                <div
                                    className="prose prose-lg premium-prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        </div>
                    )}
                </div>


            </main>

            {/* Related Products — visible on ALL devices */}
            {relatedProducts.length > 0 && (
                <div className="md:mt-8 border-t pt-4 md:pt-10 px-4 lg:px-0 pb-0">
                    <div className="container mx-auto">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-black mb-6 md:mb-8">You Might Also Like</h2>
                        <ProductGrid products={relatedProducts} />
                    </div>
                </div>
            )}
        </div>
    );
}
