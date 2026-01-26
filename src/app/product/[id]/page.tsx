import { fetchProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ImageGallery } from '@/components/product/ImageGallery';
import { StickyCartBar } from '@/components/product/StickyCartBar';
import { Star, Truck, ShieldCheck, RotateCcw, Zap, Gauge, Weight, Gamepad2, Package, CheckCircle2 } from 'lucide-react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductSpecsTable } from '@/components/product/ProductSpecsTable';
import { ProductSchema } from '@/components/product/ProductSchema';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params;

    const products = await fetchProducts();
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

    // Parse specs for feature cards
    const featureCards = [
        { icon: Zap, label: 'Battery', value: product.specs?.battery || product.voltage || '12V' },
        { icon: Gauge, label: 'Top Speed', value: product.specs?.speed || '5 km/h' },
        { icon: Weight, label: 'Max Load', value: product.specs?.max_load || '30 kg' },
        { icon: Gamepad2, label: 'Remote', value: product.specs?.mobile_app ? 'App Control' : 'Manual' },
    ];

    const whatsInBox = [
        'Ride-on vehicle (fully assembled)',
        'Parental remote control',
        'Battery charger',
        'User manual & warranty card',
    ];

    return (
        <div className="min-h-screen pb-32 md:pb-20 bg-background">
            {/* SEO Structured Data */}
            <ProductSchema product={product} />

            {/* Mobile: Full Screen Gallery / Desktop: Grid */}
            <div className="md:container md:mx-auto md:pt-8 md:grid md:grid-cols-2 md:gap-12">

                {/* Gallery Section */}
                <div className="md:rounded-2xl md:overflow-hidden md:border relative">
                    <ImageGallery images={productImages} />
                    {/* Wishlist Button */}
                    <div className="absolute top-4 right-4 z-20">
                        <WishlistButton productId={product.id} size="lg" />
                    </div>
                </div>

                {/* Details Section */}
                <div className="px-4 pt-6 md:pt-0">
                    {/* Tag & Title */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            {product.tag && (
                                <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary to-purple-600 rounded-full uppercase tracking-wider shadow-sm">
                                    {product.tag}
                                </span>
                            )}
                            {product.voltage && (
                                <span className="inline-block px-2 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full">
                                    {product.voltage}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black font-heading leading-tight mb-3">{product.name}</h1>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded-lg">
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                <span className="font-bold text-yellow-700 dark:text-yellow-400">{product.rating}</span>
                            </div>
                            <span className="text-muted-foreground hover:text-primary cursor-pointer underline decoration-dashed underline-offset-4">
                                {product.reviews} Verified Reviews
                            </span>
                        </div>
                    </div>

                    {/* Price Block */}
                    <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 p-5 rounded-2xl border border-green-100 dark:border-green-500/20">
                        <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-4xl font-black text-green-700 dark:text-green-400">₹{product.price.toLocaleString()}</span>
                            <span className="text-lg text-muted-foreground line-through">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
                            <span className="text-sm font-bold text-green-700 dark:text-green-400 bg-green-200 dark:bg-green-500/20 px-3 py-1 rounded-full animate-pulse">
                                SAVE 20%
                            </span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Inclusive of all taxes • Free shipping across India</p>
                    </div>

                    {/* Key Features Grid */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Key Features</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {featureCards.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border hover:border-primary/50 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <feature.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{feature.label}</p>
                                        <p className="text-sm font-bold">{feature.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">
                            <Truck className="w-4 h-4" />
                            <span>Free Delivery</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold">
                            <ShieldCheck className="w-4 h-4" />
                            <span>1 Year Warranty</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold">
                            <RotateCcw className="w-4 h-4" />
                            <span>7 Day Returns</span>
                        </div>
                    </div>

                    {/* Product Specifications Table */}
                    {product.specs && (
                        <div className="mb-8 p-4 bg-muted/20 rounded-2xl border">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Specifications
                            </h3>
                            <ProductSpecsTable
                                specs={product.specs}
                                additionalInfo={{
                                    "Voltage": product.voltage,
                                    "Recommended Age": product.ageGroup,
                                    "Category": product.category?.charAt(0).toUpperCase() + product.category?.slice(1)
                                }}
                            />
                        </div>
                    )}

                    {/* What's in the Box */}
                    <div className="mb-8">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            What's in the Box
                        </h3>
                        <ul className="space-y-2">
                            {whatsInBox.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Description */}
                    <div className="mb-10">
                        <h3 className="font-bold text-lg mb-3">About this Product</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {product.description || "Experience the thrill of driving with this premium ride-on toy. Designed for safety and fun, it comes equipped with all the latest features."}
                        </p>
                        <div className="space-y-2 text-sm">
                            <p className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>Realistic engine sounds and LED headlights for an authentic driving experience</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>Safety-tested build with seat belts and smooth-start technology</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>Parental remote control for supervised driving sessions</span>
                            </p>
                        </div>
                    </div>

                    {/* Customer Reviews Preview */}
                    <div className="mb-10 p-5 bg-muted/20 rounded-2xl border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Customer Reviews</h3>
                            <span className="text-sm text-primary font-medium cursor-pointer hover:underline">View All</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-center">
                                <p className="text-4xl font-black text-primary">{product.rating}</p>
                                <div className="flex text-yellow-500 justify-center my-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">{product.reviews} reviews</p>
                            </div>
                            <div className="flex-1 space-y-1">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="flex items-center gap-2 text-xs">
                                        <span className="w-3">{star}</span>
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-500 rounded-full"
                                                style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : '5%' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                            "My son absolutely loves this car! The build quality is amazing and the remote control feature gives me peace of mind."
                            <span className="block text-xs mt-1 font-medium text-foreground">— Verified Buyer</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-12 border-t pt-8">
                <h2 className="px-4 text-2xl font-bold font-heading mb-6 md:container md:mx-auto">You May Also Like</h2>
                <ProductGrid products={products.filter(p => p.id !== product.id).slice(0, 4)} />
            </div>

            {/* Mobile Sticky Bar */}
            <StickyCartBar product={product} />
        </div>
    );
}
