import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { StickyCartBar } from '@/components/product/StickyCartBar';
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
    // We use the same fetcher here. 
    // Optimization: In Next.js, requests are deduped, so calling this again is fine.
    const products = await fetchProducts(slug);
    const product = products.length > 0 ? products[0] : null;

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: `${product.name} - ABC Toyz`,
        description: product.description,
        openGraph: {
            images: product.images || [],
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
    const allProducts = await fetchProducts();
    const relatedProducts = allProducts
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 6);

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

            <div className="container mx-auto px-4 py-4 md:py-6">
                <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">
                        <Home className="w-3.5 h-3.5" />
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-border" />
                    <Link href={`/ category / ${product.category} `} className="hover:text-primary transition-colors capitalize font-medium">
                        {product.category}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-border" />
                    <span className="text-foreground font-semibold truncate max-w-[200px]">{product.name}</span>
                </nav>
            </div>

            {/* Main Section - Wider Container for Premium Feel */}
            <main className="container max-w-[1800px] mx-auto px-0 md:px-6 lg:px-8">
                <ProductMainSection product={product} boxContent={whatsInBox} />

                {/* DESKTOP FULL WIDTH DETAILS (Below Fold) */}
                <div className="hidden lg:block mt-12 max-w-7xl mx-auto space-y-16 px-4 pb-16">


                    {/* 2. Specs & Box Contents (Unified Compact Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start px-4 md:px-0">

                        {/* Specs Card */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Gauge className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Technical Specifications</h3>
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
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <Package className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">What's In The Box?</h3>
                            </div>

                            <ul className="grid grid-cols-1 gap-3">
                                {whatsInBox.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-primary/20 hover:bg-white transition-all group">
                                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-green-700 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
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
                            className="prose prose-lg dark:prose-invert mx-auto text-gray-600 dark:text-gray-300 leading-relaxed prose-img:rounded-2xl prose-img:shadow-md prose-headings:font-black prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground"
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
                {
                    relatedProducts.length > 0 && (
                        <div className="mt-16 border-t pt-16 px-4 lg:px-0">
                            <div className="container mx-auto">
                                <h2 className="text-2xl lg:text-3xl font-black mb-8">You Might Also Like</h2>
                                <ProductGrid products={relatedProducts} />
                            </div>
                        </div>
                    )
                }
            </main >

            {/* Mobile Footer Spacing for Sticky Bar */}
            < div className="h-20 lg:hidden" />

            <StickyCartBar
                product={product}
            // Note: We pass props, but StickyCartBar typically manages its own selection state 
            // or needs to correspond with ProductMainSection. 
            // For now, passing base product. ProductMainSection handles the selection UI.
            />
        </div >
    );
}
