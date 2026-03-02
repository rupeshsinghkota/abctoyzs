
export interface Product {
    id: string;
    slug: string;
    name: string;
    category: string; // Primary: cars, jeeps, bikes, etc.
    price: number;
    mrp?: number;
    regular_price?: number;
    rating: number;
    reviews: number;
    image: string;
    images: string[];
    tag?: string;
    banners?: string[]; // Marketing/Hero banners
    ad_creatives?: {
        square?: string;
        story?: string;
        landscape?: string;
    };
    specs?: {
        battery: string;
        mobile_app: boolean;
        max_load: string;
        speed: string;
        motor?: string;
        seats?: number;
        tire_type?: string;
        seat_material?: string;
        remote_control?: boolean;
        features?: string[];
        suitable_age?: string;
        charging_time?: string;
        run_time?: string;
    };
    description: string;
    // Premium Features
    videos?: string[];
    box_content?: string[];
    product_dimensions?: string;
    box_dimensions?: string;
    net_weight?: string;
    gross_weight?: string;
    voltage?: '12V' | '24V' | '36V' | '48V';
    ageGroup?: '1-3' | '3-6' | '6-10' | '10-plus';
    subCategory?: string;
    is_new?: boolean;
    is_featured?: boolean;
    stock?: number;

    // SEO
    meta_title?: string;
    meta_description?: string;

    marketing_suite?: {
        action: string;
        comfort: string;
        durability: string;
        features?: string[];
        safety?: string[];
    }; // Actually usage in code shows flat object for suite. Keeping flexible.

    // Variations Data
    attributes?: { name: string; options: string[] }[];
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: string;
    product_id: string | number;
    name: string;
    attributes: Record<string, string>; // { "Color": "Red" }
    price: number;
    mrp?: number;
    regular_price?: number;
    stock: number;
    sku?: string;
    image?: string;
}

// Structured Category Constants
export const VEHICLE_CATEGORIES = [
    { label: 'Cars', value: 'cars', image: '/categories/cat_supercar_1769364520277.webp' },
    { label: 'Jeeps & Trucks', value: 'jeeps', image: '/categories/cat_suv_1769364537319.webp' },
    { label: 'Bikes', value: 'bikes', image: '/categories/cat_motorcycle_1769364560643.webp' },
    { label: 'ATVs', value: 'atvs', image: '/categories/cat_atv_1769364577413.webp' },
    { label: 'UTVs & Buggies', value: 'utvs', image: '/categories/cat_utv_1769364600471.webp' },
    { label: 'Go-Karts', value: 'gokarts', image: '/categories/cat_gokart_1769364617852.webp' },
    { label: 'Dirt Bikes', value: 'dirtbikes', image: '/categories/cat_dirtbike.webp' },
    { label: 'Scooters', value: 'scooters', image: '/categories/cat_scooter_1769364639228.webp' },
];

export const POWER_CATEGORIES = [
    { label: '12V Power', value: '12v', description: 'Perfect for beginners (Ages 2-5)' },
    { label: '24V Beast', value: '24v', description: 'High speed & off-road (Ages 5+)' },
    { label: '36V/48V Pro', value: '36v', description: 'For older kids & teens' },
];

export const AGE_CATEGORIES = [
    { label: 'Toddlers (1-3)', value: '1-3' },
    { label: 'Preschool (3-6)', value: '3-6' },
    { label: 'Kids (6-10)', value: '6-10' },
    { label: 'Teens (10+)', value: '10-plus' },
];

import { createClient } from "@/lib/supabase/client";

// Data Fetching Helper
export async function fetchProducts(slug?: string): Promise<Product[]> {
    try {
        const supabase = createClient();
        let query = supabase
            .from('products')
            .select('*, variants:product_variants(*)');

        if (slug) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
            if (isUUID) {
                query = query.or(`slug.eq.${slug},id.eq.${slug}`);
            } else {
                query = query.eq('slug', slug);
            }
        }

        // Run products + settings queries in PARALLEL — saves one full round-trip
        const [{ data, error }, { data: settingsData }] = await Promise.all([
            query,
            supabase.from('settings').select('global_daily_discount').single(),
        ]);

        if (error) {
            console.error("[fetchProducts] Supabase error:", error);
            return [];
        }

        const discount = settingsData?.global_daily_discount ?? 0;

        if (!data || data.length === 0) {
            if (slug) {
                const { data: allData } = await supabase.from('products').select('*, variants:product_variants(*)');
                if (allData) {
                    const match = allData.find((p: any) => p.slug === slug || p.id === slug);
                    if (match) return processProducts([match], discount);
                }
            }
            return [];
        }

        return processProducts(data, discount);

    } catch (e) {
        console.error("fetchProducts error:", e);
        return [];
    }
}
// Fetch Multiple by IDs
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];

    try {
        const supabase = createClient();

        // Run both queries in PARALLEL
        const [{ data, error }, { data: settingsData }] = await Promise.all([
            supabase.from('products').select('*').in('id', ids),
            supabase.from('settings').select('global_daily_discount').single(),
        ]);

        if (error || !data) {
            console.error("fetchProductsByIds failed:", error);
            return [];
        }

        const discount = settingsData?.global_daily_discount ?? 0;
        return processProducts(data, discount);
    } catch (e) {
        console.error("getProductsByIds error:", e);
        return [];
    }
}

// Search Helper
export async function searchProducts(query: string): Promise<Product[]> {
    if (!query) return [];

    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${query}%`);

        if (error || !data) {
            console.warn("Supabase search failed.", error);
            return [];
        }

        let discount = 0;
        const { data: settingsData } = await supabase.from('settings').select('global_daily_discount').single();
        if (settingsData && settingsData.global_daily_discount) {
            discount = settingsData.global_daily_discount;
        }

        return data.map((item: any) => {
            const originalPrice = Number(item.base_price) || 0;
            const originalMrp = item.mrp ? Number(item.mrp) : originalPrice;

            let finalPrice = originalPrice;
            let finalMrp = originalMrp;

            if (discount > 0) {
                finalPrice = Math.round(originalPrice * (1 - discount / 100));
                finalMrp = Math.max(originalMrp, originalPrice);
            }

            return {
                id: item.id,
                slug: item.slug || item.id,
                name: item.name,
                category: (typeof item.category === 'string') ? item.category.toLowerCase() : 'cars',
                price: finalPrice,
                mrp: finalPrice < finalMrp ? finalMrp : undefined,
                regular_price: discount > 0 ? originalPrice : undefined,
                rating: Number(item.rating) || 0,
                reviews: Number(item.review_count) || 0,
                image: (Array.isArray(item.images) && item.images.length > 0) ? item.images[0] : '',
                images: Array.isArray(item.images) ? item.images : [],
                description: item.description || '',
                is_new: !!item.is_new,
                is_featured: !!item.is_featured,
                tag: item.is_new ? 'New' : (item.is_featured ? 'Featured' : undefined),
                specs: item.specs || {},
                voltage: item.voltage,
                ageGroup: normalizeAgeGroup(item.age_group) || item.age_group,
                subCategory: item.subCategory,
                meta_title: item.meta_title,
                meta_description: item.meta_description
            };
        }) as Product[];

    } catch (e) {
        console.error("Search error:", e);
        return [];
    }
}

// Helper to normalize age groups from DB or other sources
export function normalizeAgeGroup(input: string | undefined): '1-3' | '3-6' | '6-10' | '10-plus' | undefined {
    if (!input) return undefined;

    const normalized = input.trim().toLowerCase();

    // Direct matches
    if (normalized === '1-3' || normalized === '3-6' || normalized === '6-10' || normalized === '10-plus') {
        return normalized as any;
    }
    // Handle "10+" explicitly
    if (normalized === '10+') return '10-plus';

    // Fuzzy mapping for legacy or alternative formats
    if (['6-12', '8-12', '5-8', '5-10'].some(k => normalized.includes(k))) return '6-10';
    if (['1', '2', '3', 'toddler', '1-3 years'].some(k => normalized.includes(k) && !normalized.includes('10'))) return '1-3';
    if (['4', '5', '3-5', '3-6 years', 'preschool'].some(k => normalized.includes(k))) return '3-6';
    if (['6', '7', '8', '9', 'school', 'kid'].some(k => normalized.includes(k) && !normalized.includes('10'))) return '6-10';
    if (['10', '11', '12', 'teen', 'adult', 'big'].some(k => normalized.includes(k))) return '10-plus';

    return undefined;
}

// Helper to map DB result to Product interface
function processProducts(data: any[], globalDiscount: number = 0): Product[] {
    return data.map((item: any) => {
        const originalPrice = Number(item.base_price) || 0;
        const originalMrp = item.mrp ? Number(item.mrp) : originalPrice;

        let finalPrice = originalPrice;
        let finalMrp = originalMrp;

        if (globalDiscount > 0) {
            finalPrice = Math.round(originalPrice * (1 - globalDiscount / 100));
            // When discounting, ensure MRP stringly represents the original highest value
            finalMrp = Math.max(originalMrp, originalPrice);
        }

        const variants = Array.isArray(item.variants) ? item.variants.map((v: any) => {
            const vOrigPrice = v.price || originalPrice;
            const vOrigMrp = v.mrp || originalMrp;
            let vFinalPrice = vOrigPrice;
            let vFinalMrp = vOrigMrp;

            if (globalDiscount > 0) {
                vFinalPrice = Math.round(vOrigPrice * (1 - globalDiscount / 100));
                vFinalMrp = Math.max(vOrigMrp, vOrigPrice);
            }

            return { ...v, price: vFinalPrice, mrp: vFinalMrp, regular_price: globalDiscount > 0 ? vOrigPrice : undefined };
        }) : [];

        return {
            id: item.id,
            slug: item.slug || item.id,
            name: item.name || 'Untitled Product',
            category: (typeof item.category === 'string' && item.category.trim()) ? item.category.toLowerCase() : 'cars',
            price: finalPrice,
            mrp: finalPrice < finalMrp ? finalMrp : undefined,
            regular_price: globalDiscount > 0 ? originalPrice : undefined,
            rating: Number(item.rating) || 0,
            reviews: Number(item.review_count) || 0,
            image: (Array.isArray(item.images) && item.images.length > 0) ? item.images[0] : '',
            images: Array.isArray(item.images) ? item.images : [],
            description: item.description || '',
            banners: Array.isArray(item.banners) ? item.banners : [],
            is_new: !!item.is_new,
            is_featured: !!item.is_featured,
            stock: Number(item.stock) || 0,
            tag: item.is_new ? 'New' : (item.is_featured ? 'Featured' : undefined),
            specs: item.specs || {},
            voltage: item.voltage,
            ageGroup: normalizeAgeGroup(item.age_group) || item.age_group,
            subCategory: item.subCategory,
            videos: Array.isArray(item.videos) ? item.videos : [],
            box_content: Array.isArray(item.box_content) ? item.box_content : [],
            product_dimensions: item.product_dimensions,
            box_dimensions: item.box_dimensions,
            net_weight: item.net_weight,
            gross_weight: item.gross_weight,
            attributes: Array.isArray(item.attributes) ? item.attributes : [],
            variants: variants,
            meta_title: item.meta_title,
            meta_description: item.meta_description,
            marketing_suite: item.marketing_suite,
            ad_creatives: item.ad_creatives
        };
    });
}
