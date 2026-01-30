import { HeroSlider } from "@/components/home/HeroSlider";
import { Stories } from "@/components/home/Stories";
import { ProductStrip } from "@/components/home/ProductStrip";
import { Benefits } from "@/components/home/Benefits";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Newsletter } from "@/components/home/Newsletter";
import { fetchProducts } from "@/lib/data";

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

      {/* Promo Banner Placeholder */}
      <div className="px-4 py-6">
        <div className="w-full h-32 md:h-48 bg-gradient-to-r from-primary to-orange-600 rounded-2xl flex items-center justify-between px-6 md:px-12 text-white relative overflow-hidden shadow-lg shadow-orange-500/20">
          <div className="relative z-10">
            <span className="text-xs md:text-sm font-bold opacity-90 uppercase tracking-widest">Limited Offer</span>
            <h3 className="text-2xl md:text-3xl font-black mt-1">Get 10% OFF</h3>
            <p className="text-sm md:text-base opacity-90">On your first app order</p>
            <button className="mt-3 px-4 py-1.5 bg-white text-primary text-xs font-bold rounded-full">Use Code: ABCAPP</button>
          </div>
          <div className="relative z-10 opacity-20 transform scale-150 rotate-12">
            {/* Decorative icon or text */}
            <h1 className="text-8xl font-black">TOYS</h1>
          </div>
        </div>
      </div>

      <ProductStrip title="Trending Now" products={trending} viewAllLink="/category/all" />

      <Newsletter />
    </div>
  );
}
