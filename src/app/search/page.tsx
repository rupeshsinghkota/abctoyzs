'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { searchProducts, Product } from '@/lib/data';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Search, X, Loader2 } from 'lucide-react';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [allResults, setAllResults] = useState<Product[]>([]);
    const [filteredResults, setFilteredResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Update URL when query changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        // Debounce URL update slightly
        const timeoutId = setTimeout(() => {
            if (query) {
                params.set('q', query);
                router.replace(`/search?${params.toString()}`, { scroll: false });
            } else {
                params.delete('q');
                router.replace('/search', { scroll: false });
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query, router]);

    // Async Fetch Results
    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setAllResults([]);
                return;
            }
            setLoading(true);
            try {
                const data = await searchProducts(query);
                setAllResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Apply Client-Side Filters
    useEffect(() => {
        let results = [...allResults];

        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 100000;
        const voltage = searchParams.get('voltage')?.split(',') || [];
        const age = searchParams.get('age')?.split(',') || [];
        const seats = searchParams.get('seats')?.split(',') || [];
        const remote = searchParams.get('remote')?.split(',') || [];
        const motors = searchParams.get('motors')?.split(',') || [];

        results = results.filter(p => {
            if (p.price < minPrice || p.price > maxPrice) return false;
            if (voltage.length > 0 && (!p.voltage || !voltage.includes(p.voltage))) return false;
            if (age.length > 0 && (!p.ageGroup || !age.includes(p.ageGroup))) return false;
            if (seats.length > 0) {
                const productSeats = p.specs?.seats?.toString();
                if (!productSeats || !seats.includes(productSeats)) return false;
            }
            if (remote.length > 0) {
                const hasRemote = p.specs?.remote_control;
                if (remote.includes('yes') && !hasRemote) return false;
                if (remote.includes('no') && hasRemote) return false;
            }
            if (motors.length > 0) {
                const motorCount = p.specs?.motor?.toLowerCase();
                if (!motorCount) return false;
                const matches = motors.some(m => motorCount.includes(m));
                if (!matches) return false;
            }
            return true;
        });

        setFilteredResults(results);
    }, [allResults, searchParams]);

    return (
        <div className="min-h-screen pb-20 bg-background">
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b px-4 py-3">
                <div className="relative max-w-2xl mx-auto flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search for toys..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                            className="w-full bg-muted/50 rounded-xl pl-10 pr-10 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <ProductFilters />
                </div>
            </div>

            <div className="pt-4 container mx-auto">
                {query ? (
                    loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                            <p className="text-muted-foreground">Searching for "{query}"...</p>
                        </div>
                    ) : filteredResults.length > 0 ? (
                        <>
                            <p className="px-4 text-sm text-muted-foreground mb-4">
                                Found {filteredResults.length} results for "{query}"
                            </p>
                            <ProductGrid products={filteredResults} />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No results found</h3>
                            <p className="text-muted-foreground">
                                We couldn't find any products matching your search and filters. <br />
                                Try adjusting your filters or search query.
                            </p>
                        </div>
                    )
                ) : (
                    <div className="px-4 py-12 text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">What are you looking for?</h2>
                        <p className="text-muted-foreground">
                            Search for "Cars", "Bikes", or specific models like "BMW".
                            <br /><span className="text-xs text-muted-foreground/60">(Powered by Supabase DB)</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
