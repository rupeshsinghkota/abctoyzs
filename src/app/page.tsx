import { HeroSlider } from "@/components/home/HeroSlider";
import { Stories } from "@/components/home/Stories";
import { ProductStrip } from "@/components/home/ProductStrip";
import { Benefits } from "@/components/home/Benefits";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Newsletter } from "@/components/home/Newsletter";
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
  const trending = products.filter(p => p.is_featured || p.rating >= 4.8 || p.tag === 'Best Seller').slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <HeroSlider />
      <Stories />
      <Benefits />

      <ProductStrip title="New Arrivals" products={newArrivals} viewAllLink="/category/new" />

      <CategoryGrid />



      <ProductStrip title="Trending Now" products={trending} viewAllLink="/category/all" />

      <Newsletter />
    </div>
  );
}
