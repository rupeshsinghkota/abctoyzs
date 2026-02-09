import { HeroSlider } from "@/components/home/HeroSlider";
import { Stories } from "@/components/home/Stories";
import { ProductStrip } from "@/components/home/ProductStrip";
import { Benefits } from "@/components/home/Benefits";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Newsletter } from "@/components/home/Newsletter";
import { LazySection } from "@/components/common/LazySection";
import { FeatureSpotlight } from "@/components/home/FeatureSpotlight";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductHighlightGrid } from "@/components/home/ProductHighlightGrid";
import { Testimonials } from "@/components/home/Testimonials";
import { ShopByAge } from "@/components/home/ShopByAge";
import { ShopByPower } from "@/components/home/ShopByPower";
import { ShopByBudget } from "@/components/home/ShopByBudget";
import { fetchProducts } from "@/lib/data";
import { Metadata } from 'next';
import { SettingsService } from '@/lib/services/settings';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 300; // Revalidate every 5 minutes

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const global = await SettingsService.getSEOConfig(supabase);
  const home = await SettingsService.getSegmentSEO('homepage', supabase);

  return {
    title: home.defaultTitle || "Home of Premium Ride-on Toys",
    description: home.defaultDescription || "Browse our collection of luxury electric cars, bikes, and jeeps for children. Fast 24-48 hour dispatch and Pan-India delivery.",
  };
}

export default async function Home() {
  // Fetch all products
  const products = await fetchProducts();

  // Filter for sections (using real logic now)
  const newArrivals = products.filter(p => p.tag === 'New' || p.is_new).slice(0, 10);

  // If no 'Trending' tag exists in data, just take the high rated ones, or explicitly featured
  const trending = products.filter(p => (p.is_featured || p.rating >= 4.8 || p.tag === 'Best Seller') && !newArrivals.includes(p)).slice(0, 10);

  // Additional Categories for Extended Content
  const topRated = products.filter(p => p.rating >= 4.5).sort((a, b) => b.rating - a.rating).slice(0, 10);
  const premium = products.filter(p => p.price >= 20000).sort((a, b) => b.price - a.price).slice(0, 10);
  const budget = products.filter(p => p.price < 15000).sort((a, b) => a.price - b.price).slice(0, 10);

  // Category Highlights
  const bikes = products.filter(p => p.category === 'bikes').slice(0, 10);
  const jeeps = products.filter(p => p.category === 'jeeps').slice(0, 10);

  // Spotlight Product (Highest Price or IsFeatured)
  const featuredProduct = products.find(p => p.is_featured) || products.reduce((prev, current) => (prev.price > current.price) ? prev : current, products[0]);


  return (
    <div className="flex flex-col min-h-screen pb-20">
      <HeroSlider />
      <Stories />
      <Benefits />

      {/* Shop By Age */}
      <LazySection className="mt-2" placeholderHeight="h-48">
        <ShopByAge />
      </LazySection>

      {/* First Fold Content (Eager Loaded) */}
      <ProductStrip title="New Arrivals" products={newArrivals} viewAllLink="/category/new" />
      <CategoryGrid />

      {/* Shop By Power */}
      <LazySection className="mt-2" placeholderHeight="h-64">
        <ShopByPower />
      </LazySection>

      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black">Trending Collection</h2>
          <a href="/category/all" className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 hover:text-primary hover:border-primary transition-colors">View All</a>
        </div>
        <ProductGrid products={trending} initialCount={4} loadMoreCount={4} />
      </div>

      {/* Feature Spotlight (Lazy) */}
      <LazySection className="mt-2" placeholderHeight="h-96">
        <FeatureSpotlight product={featuredProduct} />
      </LazySection>

      <LazySection className="mt-2" placeholderHeight="h-64">
        <ProductStrip title="Premium Collection" products={premium} viewAllLink="/category/power/24v" />
      </LazySection>

      {/* Category Highlights */}
      {bikes.length > 0 && (
        <LazySection className="mt-2" placeholderHeight="h-64">
          <ProductStrip title="Super Bikes" products={bikes} viewAllLink="/category/bikes" />
        </LazySection>
      )}

      {jeeps.length > 0 && (
        <LazySection className="mt-2" placeholderHeight="h-64">
          <div className="py-4 bg-zinc-50/50">
            <ProductStrip title="Rugged Jeeps & SUVs" products={jeeps} viewAllLink="/category/jeeps" />
          </div>
        </LazySection>
      )}

      {/* Shop By Budget */}
      <LazySection className="mt-2" placeholderHeight="h-48">
        <ShopByBudget />
      </LazySection>

      <LazySection className="mt-2 mb-8" placeholderHeight="h-64">
        <ProductStrip title="Budget Friendly Picks" products={budget} viewAllLink="/category/all" />
      </LazySection>

      <Testimonials />
      <Newsletter />
    </div>
  );
}
