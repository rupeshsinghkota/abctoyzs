
export interface Product {
    id: string;
    slug: string;
    name: string;
    category: string; // Primary: cars, jeeps, bikes, etc.
    price: number;
    mrp?: number;
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
    ageGroup?: '1-3' | '3-6' | '6-10' | '10+';
    subCategory?: string;
    is_new?: boolean;
    is_featured?: boolean;

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
    stock: number;
    sku?: string;
    image?: string;
}

// Structured Category Constants
export const VEHICLE_CATEGORIES = [
    { label: 'Cars', value: 'cars', image: '/categories/cat_supercar_1769364520277.png' },
    { label: 'Jeeps & Trucks', value: 'jeeps', image: '/categories/cat_suv_1769364537319.png' },
    { label: 'Bikes', value: 'bikes', image: '/categories/cat_motorcycle_1769364560643.png' },
    { label: 'ATVs', value: 'atvs', image: '/categories/cat_atv_1769364577413.png' },
    { label: 'UTVs & Buggies', value: 'utvs', image: '/categories/cat_utv_1769364600471.png' },
    { label: 'Go-Karts', value: 'gokarts', image: '/categories/cat_gokart_1769364617852.png' },
    { label: 'Dirt Bikes', value: 'dirtbikes', image: '/categories/cat_dirtbike.png' },
    { label: 'Scooters', value: 'scooters', image: '/categories/cat_scooter_1769364639228.png' },
];

export const POWER_CATEGORIES = [
    { label: '12V Power', value: '12v', description: 'Perfect for beginners (Ages 2-5)' },
    { label: '24V Beast', value: '24v', description: 'High speed & off-road (Ages 5+)' },
    { label: '36V/48V Pro', value: '36v', description: 'For older kids & teens' },
];

export const AGE_CATEGORIES = [
    { label: 'Toddlers (1-3)', value: '1-3' },
    { label: 'Preschool (3-6)', value: '3-6' },
    { label: 'Big Kids (6-12)', value: '6-12' },
];

import { createClient } from "@/lib/supabase/client";

export const products: Product[] = [
    {
        id: '1',
        name: 'BMW M5 Competition Ride-On',
        category: 'cars',
        subCategory: 'Sports',
        price: 24999,
        mrp: 34999,
        rating: 4.8,
        reviews: 124,
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=60',
        ],
        videos: [
            'https://cdn.coverr.co/videos/coverr-driving-a-go-cart-4560/1080p.mp4'
        ],
        tag: 'New',
        specs: { battery: '12V 7Ah', mobile_app: true, max_load: '30kg', speed: '3-5 km/h', charging_time: '8-10 Hours', run_time: '1-2 Hours' },
        description: "The officially licensed BMW M5 Competition ride-on car delivers the ultimate driving experience for your little one.",
        voltage: '12V',
        ageGroup: '3-6',
        slug: 'bmw-m5-competition-ride-on'
    },
    {
        id: '2',
        name: 'Jeep Wrangler Rubicon Style',
        category: 'jeeps',
        subCategory: 'Off-road',
        price: 18500,
        mrp: 25999,
        rating: 4.5,
        reviews: 89,
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60',
        ],
        tag: 'Best Seller',
        specs: { battery: '12V 10Ah', mobile_app: false, max_load: '35kg', speed: '3-6 km/h', charging_time: '8-12 Hours', run_time: '45-90 Mins' },
        description: "Conquer the backyard with this rugged Jeep style ride-on.",
        voltage: '12V',
        ageGroup: '3-6',
        slug: 'jeep-wrangler-rubicon-style'
    },
    {
        id: '3',
        name: 'Ducati Panigale V4 Replica',
        category: 'bikes',
        subCategory: 'Sport Bike',
        price: 12999,
        mrp: 17999,
        rating: 4.9,
        reviews: 45,
        image: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&auto=format&fit=crop&q=60'
        ],
        specs: { battery: '12V 4.5Ah', mobile_app: false, max_load: '25kg', speed: '3-5 km/h', charging_time: '6-8 Hours', run_time: '45-60 Mins' },
        description: "For the speed enthusiasts! This Ducati replica features hand throttle acceleration.",
        voltage: '12V',
        ageGroup: '3-6',
        slug: 'ducati-panigale-v4-replica'
    },
    {
        id: '4',
        name: 'Mercedes AMG G63 24V',
        category: 'cars',
        subCategory: 'Luxury',
        price: 34999,
        mrp: 48999,
        rating: 4.7,
        reviews: 210,
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=60'
        ],
        specs: { battery: '24V 7Ah', mobile_app: true, max_load: '50kg', speed: '6-8 km/h', charging_time: '10-14 Hours', run_time: '60-120 Mins' },
        description: "Luxury meets play. The G63 AMG ride-on is a showstopper with painted finish.",
        voltage: '24V',
        ageGroup: '6-10',
        slug: 'mercedes-amg-g63-24v'
    },
    {
        id: '5',
        name: 'Maverick UTV Buggy',
        category: 'utvs',
        subCategory: 'Buggy',
        price: 45000,
        mrp: 62999,
        rating: 4.9,
        reviews: 12,
        image: 'https://images.unsplash.com/photo-1583578768565-385d56b0051e?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1583578768565-385d56b0051e?w=800&auto=format&fit=crop&q=60'
        ],
        tag: 'Beast Mode',
        specs: { battery: '24V 14Ah', mobile_app: true, max_load: '60kg', speed: '10-15 km/h', charging_time: '12-16 Hours', run_time: '90-150 Mins' },
        description: "The ultimate off-road machine for kids. 2-seater, 4x4 drive.",
        voltage: '24V',
        ageGroup: '6-10',
        slug: 'maverick-utv-buggy'
    },
    {
        id: '6',
        name: 'Drift Go-Kart Pro',
        category: 'gokarts',
        subCategory: 'Drift',
        price: 22000,
        mrp: 30999,
        rating: 4.6,
        reviews: 56,
        image: 'https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?w=800&auto=format&fit=crop&q=60'
        ],
        specs: { battery: '24V', mobile_app: false, max_load: '45kg', speed: '12 km/h', charging_time: '8-10 Hours', run_time: '40-60 Mins' },
        description: "For the young racer. Special drift wheels for sliding action.",
        voltage: '24V',
        ageGroup: '6-10',
        slug: 'drift-go-kart-pro'
    }
];

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
            console.error("[fetchProducts] Supabase error:", error);
            console.log("[fetchProducts] Falling back to static data.");
            return processProducts(products); // Fallback to static data
        }

        if (!data || data.length === 0) {
            console.warn("[fetchProducts] Warning: Supabase returned no data. count:", data?.length);

            // FALLBACK MECHANISM: If looking for a specific slug but failed, try fetching ALL and filtering.
            // This fixes issues where 'eq' or 'or' query might fail due to RLS or tricky slug characters.
            if (slug) {
                console.log(`[fetchProducts] Attempting Global Fallback for slug: ${slug}`);
                const { data: allData } = await supabase.from('products').select('*, variants:product_variants(*)');
                if (allData) {
                    const match = allData.find((p: any) => p.slug === slug || p.id === slug);
                    if (match) {
                        console.log("[fetchProducts] Found via Global Fallback!");
                        // Use helper to process single item wrapped in array
                        return processProducts([match]);
                    }
                }
            }

            console.log("[fetchProducts] Falling back to static data (no DB data found).");
            // If slug provided, filter static data
            if (slug) {
                const staticMatch = products.find(p => p.slug === slug || p.id === slug);
                return staticMatch ? processProducts([staticMatch as any]) : []; // processProducts expects array
            }
            return processProducts(products); // Return all static products
        }

        return processProducts(data);

    } catch (e) {
        console.error("fetchProducts error:", e);
        console.log("[fetchProducts] Falling back to static data (exception).");
        if (slug) {
            const staticMatch = products.find(p => p.slug === slug || p.id === slug);
            return staticMatch ? processProducts([staticMatch as any]) : [];
        }
        return processProducts(products);
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

        if (data.length === 0) {
            return [];
        }

        // Parse search results (simplified mapping)
        return data.map((item: any) => ({
            id: item.id,
            slug: item.slug || item.id,
            name: item.name,
            category: 'cars',
            price: item.base_price,
            mrp: item.mrp,
            rating: item.rating || 0,
            reviews: item.review_count || 0,
            image: item.images?.[0] || '',
            images: item.images || [],
            description: item.description || '',
            is_new: !!item.is_new,
            is_featured: !!item.is_featured,
            tag: item.is_new ? 'New' : (item.is_featured ? 'Featured' : undefined),
            specs: item.specs || {},
            voltage: item.voltage,
            ageGroup: item.age_group,
            subCategory: item.subCategory,
            meta_title: item.meta_title,
            meta_description: item.meta_description
        })) as Product[];

    } catch (e) {
        console.error("Search error:", e);
        return [];
    }
}

// Helper to map DB result to Product interface (extracted to avoid duplication)
function processProducts(data: any[]): Product[] {
    // Merge with static products data
    return data.map((item: any) => {
        const mappedProduct = {
            id: item.id,
            slug: item.slug || item.id,
            name: item.name || 'Untitled Product',
            // SAFETY: Check if category is a string before calling toLowerCase
            category: (typeof item.category === 'string' && item.category.trim()) ? item.category.toLowerCase() : 'cars',
            price: Number(item.base_price) || 0,
            mrp: item.mrp ? Number(item.mrp) : undefined,
            rating: Number(item.rating) || 0,
            reviews: Number(item.review_count) || 0,
            // SAFETY: Check if images is actually an array
            image: (Array.isArray(item.images) && item.images.length > 0) ? item.images[0] : '',
            images: Array.isArray(item.images) ? item.images : [],
            description: item.description || '',
            banners: Array.isArray(item.banners) ? item.banners : [],
            // Correctly map the boolean flags
            is_new: !!item.is_new,
            is_featured: !!item.is_featured,
            tag: item.is_new ? 'New' : (item.is_featured ? 'Featured' : undefined),
            specs: item.specs || {},
            voltage: item.voltage,
            ageGroup: item.age_group,
            subCategory: item.subCategory,
            // Premium & Variations
            videos: Array.isArray(item.videos) ? item.videos : [],
            box_content: Array.isArray(item.box_content) ? item.box_content : [],
            product_dimensions: item.product_dimensions,
            box_dimensions: item.box_dimensions,
            net_weight: item.net_weight,
            gross_weight: item.gross_weight,
            attributes: Array.isArray(item.attributes) ? item.attributes : [],
            variants: Array.isArray(item.variants) ? item.variants : [],
            meta_title: item.meta_title,
            meta_description: item.meta_description,
            marketing_suite: item.marketing_suite,
            ad_creatives: item.ad_creatives
        };

        // Find matching static product to overlay data
        const staticMatch = products.find(p => p.slug === mappedProduct.slug || p.id === mappedProduct.id);
        if (staticMatch) {
            return {
                ...mappedProduct,
                ...staticMatch, // Static data overrides DB data (useful for hardcoding MRPs, specs, etc.)
            };
        }
        return mappedProduct;
    });
}
