import { createClient } from '@/lib/supabase/server';
import { Product, processProducts } from '@/lib/data';

// Data Fetching Helper for Server Components
export async function fetchProductsServer(slug?: string): Promise<Product[]> {
    try {
        const supabase = await createClient();
        let query = supabase
            .from('products')
            .select('*, variants:product_variants(*)');

        if (slug) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
            if (isUUID) {
                // If it looks like a UUID, check BOTH slug (text) and id (uuid) cols
                query = query.or(`slug.eq.${slug},id.eq.${slug}`);
            } else {
                // If it's NOT a UUID (e.g. "bmw-m5"), ONLY check slug col. 
                // Checks against ID col would crash with "invalid input syntax for type uuid"
                query = query.eq('slug', slug);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error("[fetchProductsServer] Supabase error:", error);
            return [];
        }

        if (!data || data.length === 0) {
            console.warn("[fetchProductsServer] Warning: Supabase returned no data. count:", data?.length);

            // FALLBACK MECHANISM
            if (slug) {
                console.log(`[fetchProductsServer] Attempting Global Fallback for slug: ${slug}`);
                const { data: allData } = await supabase.from('products').select('*, variants:product_variants(*)');
                if (allData) {
                    const match = allData.find((p: any) => p.slug === slug || p.id === slug);
                    if (match) {
                        console.log("[fetchProductsServer] Found via Global Fallback!");
                        // Use helper to process single item wrapped in array
                        return processProducts([match]);
                    }
                }
            }
            return [];
        }

        return processProducts(data);

    } catch (e) {
        console.error("fetchProductsServer error:", e);
        return [];
    }
}
