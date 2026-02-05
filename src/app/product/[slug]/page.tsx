import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Share2, Heart, ShoppingBag, Gauge, Package, ArrowRight, Wallet, ShieldCheck, Zap, Medal, Star, Weight, Gamepad2, CheckCircle2, Truck, Baby } from 'lucide-react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { ProductSchema } from '@/components/product/ProductSchema';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import Link from 'next/link';
import { ProductMainSection } from '@/components/product/ProductMainSection';
import { ProductCard } from '@/components/shop/ProductCard';
import { Metadata } from 'next';
import { MarketingHero } from '@/components/product/MarketingHero';

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
export const revalidate = 0;

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
    const whatsInBox = product.box_content && product.box_content.length > 0
        ? product.box_content
        : [
            'Ride-on vehicle (fully assembled)',
            '2.4G Parental Remote Control',
            'Rechargeable Battery & Charger',
            'User Manual & Warranty Card',
            'Assembly Tools'
        ];




    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            {/* ... (schema and breadcrumb unchanged) */}
            <ProductSchema product={product} />

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
                                    "Category": product.category?.charAt(0).toUpperCase() + product.category?.slice(1)
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

                    {/* 3. In-Depth Review (AI Generated with embedded images) */}
                    <div className="max-w-4xl mx-auto border-t pt-10">
                        <div className="text-center mb-6">
                            <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider">
                                In-Depth Review
                            </span>
                            <h3 className="text-2xl font-black mt-3">About This Ride-On</h3>
                        </div>

                        <div
                            className="prose premium-prose mx-auto"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                </div>

                {/* 4. Brand Promise / Trust Signals - Redesigned for Premium Trust */}
                <div className="border-t border-b border-gray-100 bg-gray-50/50 py-16 mt-16 mb-16">
                    <div className="text-center max-w-3xl mx-auto px-4 mb-10">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                            <Star className="w-6 h-6 text-primary fill-primary" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 text-gray-900">The ABC Toyz Promise</h3>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            We don't just sell toys; we deliver childhood memories.
                            Every vehicle is inspected, verified, and backed by our ironclad guarantee.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                        {/* Trust Card 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all duration-300 text-center group">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100 transition-colors">
                                <ShieldCheck className="w-7 h-7 text-green-600" />
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-gray-900">Certified Safe</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">BIS & EN71 compliant. Child-safe materials and speed-governed electronics for your peace of mind.</p>
                        </div>

                        {/* Trust Card 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all duration-300 text-center group">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                                <Zap className="w-7 h-7 text-blue-600" />
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-gray-900">Power Performance</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">Genuine high-capacity batteries and copper-wound motors for longer playtime and better torque.</p>
                        </div>

                        {/* Trust Card 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all duration-300 text-center group">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100 transition-colors">
                                <Medal className="w-7 h-7 text-purple-600" />
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-gray-900">Lifetime Support</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">We settle for nothing less than 5 stars. Spare parts and technical help available for years.</p>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 border-t pt-16 px-4 lg:px-0">
                        <div className="container mx-auto">
                            <h2 className="text-2xl lg:text-3xl font-black mb-8">You Might Also Like</h2>
                            <ProductGrid products={relatedProducts} />
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Footer Spacing for Sticky Bar */}
            <div className="h-20 lg:hidden" />
        </div>
    );
}
