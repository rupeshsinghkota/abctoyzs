import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { StickyCartBar } from '@/components/product/StickyCartBar';
import { Star, Truck, ShieldCheck, RotateCcw, Zap, Gauge, Weight, Gamepad2, Package, CheckCircle2, ChevronRight, Home } from 'lucide-react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { ProductSchema } from '@/components/product/ProductSchema';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import Link from 'next/link';
import { ProductMainSection } from '@/components/product/ProductMainSection';
import { ProductCard } from '@/components/shop/ProductCard';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const products = await fetchProducts();
    const product = products.find((p) => p.id === id);

    if (!product) return { title: 'Product Not Found' };

    return {
        title: product.meta_title || product.name,
        description: product.meta_description || product.description.substring(0, 160),
    };
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params;

    const products = await fetchProducts();
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    // Get related products (SAME CATEGORY, excluding current)
    const relatedProducts = products
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 6); // Show up to 6 items in scroll

    const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

    // Feature highlights
    const highlights = [
        { icon: Zap, label: 'Battery', value: product.specs?.battery || product.voltage || '12V Power' },
        { icon: Gauge, label: 'Speed', value: product.specs?.speed || '5-8 km/h' },
        { icon: Weight, label: 'Load', value: product.specs?.max_load || '30 kg' },
        { icon: Gamepad2, label: 'Control', value: product.specs?.mobile_app ? 'App & Remote' : 'Remote' },
    ];

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
            <ProductSchema product={product} />

            {/* Breadcrumb - Clean & Minimal */}
            <div className="container mx-auto px-4 py-4 md:py-6">
                <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">
                        <Home className="w-3.5 h-3.5" />
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-border" />
                    <Link href={`/category/${product.category}`} className="hover:text-primary transition-colors capitalize font-medium">
                        {product.category}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-border" />
                    <span className="text-foreground font-semibold truncate max-w-[200px]">{product.name}</span>
                </nav>
            </div>

            <main className="container mx-auto px-0 md:px-4">
                <ProductMainSection product={product} />

                {/* DESKTOP FULL WIDTH DETAILS (Below Fold) */}
                <div className="hidden lg:block mt-12 max-w-7xl mx-auto space-y-16 px-4 pb-16">

                    {/* 1. Key Highlights (Visual Grid) */}
                    <div className="text-center">
                        <h3 className="text-xl font-black mb-6">Why Kids Love It</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {highlights.map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-5 rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-all border border-transparent hover:border-border group">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                        <item.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">{item.label}</span>
                                    <span className="text-base font-black text-foreground">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Specs & Box Contents (Split Layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-t pt-10">
                        {/* Specs Table */}
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                <Gauge className="w-5 h-5 text-primary" />
                                Technical Specifications
                            </h3>
                            <ProductSpecs
                                specs={product.specs}
                                additionalInfo={{
                                    "Voltage": product.voltage,
                                    "Recommended Age": product.ageGroup,
                                    "Category": product.category?.charAt(0).toUpperCase() + product.category?.slice(1)
                                }}
                            />
                        </div>

                        {/* Box Contents */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                What's In The Box?
                            </h3>
                            <ul className="space-y-3">
                                {whatsInBox.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 3. Long Description (Editorial Style - Centered for Readability) */}
                    <div className="max-w-4xl mx-auto border-t pt-10">
                        <div className="text-center mb-6">
                            <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider">
                                In-Depth Review
                            </span>
                            <h3 className="text-2xl font-black mt-3">The Ultimate Riding Experience</h3>
                        </div>

                        <div className="prose prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 prose-h3:text-xl prose-h3:font-bold prose-ul:list-disc prose-ul:pl-5">
                            {product.description ? (
                                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                            ) : (
                                <p>The ultimate driving experience for your little one. This premium ride-on car combines authentic styling with advanced safety features. Equipped with a powerful battery, smooth suspension, and parental remote control, it ensures hours of safe and thrilling fun.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products Section (Scrollable & Same Category) */}
                <div className="mt-12 border-t pt-10 max-w-7xl mx-auto px-4 pb-24">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black">You May Also Like</h3>
                        <Link
                            href={`/category/${product.category}`}
                            className="text-xs font-bold text-primary uppercase tracking-wider hover:underline underline-offset-4 cursor-pointer flex items-center gap-1"
                        >
                            More {product.category}
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto pb-8 -mx-4 px-4 gap-4 snap-x hide-scrollbar scroll-smooth">
                        {relatedProducts.map((p) => (
                            <div key={p.id} className="snap-center shrink-0 w-[200px] md:w-[240px]">
                                <ProductCard product={p} className="h-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Mobile Footer Bar */}
            <StickyCartBar product={product} />
        </div>
    );
}

