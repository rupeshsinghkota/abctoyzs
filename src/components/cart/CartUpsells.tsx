"use client";

import { useStore } from "@/store/useStore";
import { ProductCard } from "@/components/shop/ProductCard";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Product, fetchProducts } from "@/lib/data";

export function CartUpsells() {
    const [upsellProducts, setUpsellProducts] = useState<Product[]>([]);
    const { cart } = useStore();

    useEffect(() => {
        const loadUpsells = async () => {
            const allProducts = await fetchProducts();
            // Filter out items already in cart
            const cartIds = new Set(cart.map(item => item.id));
            // Get featured or top rated products as upsells
            const filtered = allProducts
                .filter(p => !cartIds.has(p.id))
                .sort(() => 0.5 - Math.random()) // Randomize for variety
                .slice(0, 3);

            setUpsellProducts(filtered);
        };
        loadUpsells();
    }, [cart]);

    if (upsellProducts.length === 0) return null;

    return (
        <section className="mt-12 bg-white rounded-[28px] p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">Complete Your <span className="text-primary italic">Collection</span></h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Other parents also loved these</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upsellProducts.map((product) => (
                    <div key={product.id} className="group transition-all">
                        <ProductCard product={product} className="shadow-none border-gray-50 bg-zinc-50/50" />
                    </div>
                ))}
            </div>
        </section>
    );
}
