"use client";

import { useEffect, useState } from 'react';
import { WishlistService } from '@/lib/services/wishlist';
import { fetchProducts, Product } from '@/lib/data';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Heart, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuthAndLoadWishlist();
    }, []);

    async function checkAuthAndLoadWishlist() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login?next=/wishlist');
            return;
        }

        try {
            const wishlistIds = await WishlistService.getWishlist();
            const allProducts = await fetchProducts();
            const filteredProducts = allProducts.filter(p => wishlistIds.includes(p.id));
            setWishlistProducts(filteredProducts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
                <Link href="/profile" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">My Wishlist</h1>
            </div>

            <div className="container mx-auto py-4">
                {wishlistProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
                        <p className="text-muted-foreground mb-8 max-w-sm">
                            Tap the heart icon on any product to save it for later.
                        </p>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="px-4 text-sm text-muted-foreground mb-4">
                            {wishlistProducts.length} item{wishlistProducts.length > 1 ? 's' : ''} saved
                        </p>
                        <ProductGrid products={wishlistProducts} />
                    </>
                )}
            </div>
        </div>
    );
}
