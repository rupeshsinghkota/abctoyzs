export interface Product {
    id: string;
    name: string;
    category: string; // Primary: cars, jeeps, bikes, etc.
    price: number;
    rating: number;
    reviews: number;
    image: string;
    images: string[];
    tag?: string;
    specs?: {
        battery: string;
        mobile_app: boolean;
        max_load: string;
        speed: string;
    };
    description: string;
    // New Fields
    videos?: string[];
    voltage?: '12V' | '24V' | '36V' | '48V';
    ageGroup?: '1-3' | '3-6' | '6-10' | '10+';
    subCategory?: string;
    is_new?: boolean;
    is_featured?: boolean;
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
        specs: { battery: '12V 7Ah', mobile_app: true, max_load: '30kg', speed: '3-5 km/h' },
        description: "The officially licensed BMW M5 Competition ride-on car delivers the ultimate driving experience for your little one.",
        voltage: '12V',
        ageGroup: '3-6'
    },
    {
        id: '2',
        name: 'Jeep Wrangler Rubicon Style',
        category: 'jeeps',
        subCategory: 'Off-road',
        price: 18500,
        rating: 4.5,
        reviews: 89,
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60',
        ],
        tag: 'Best Seller',
        specs: { battery: '12V 10Ah', mobile_app: false, max_load: '35kg', speed: '3-6 km/h' },
        description: "Conquer the backyard with this rugged Jeep style ride-on.",
        voltage: '12V',
        ageGroup: '3-6'
    },
    {
        id: '3',
        name: 'Ducati Panigale V4 Replica',
        category: 'bikes',
        subCategory: 'Sport Bike',
        price: 12999,
        rating: 4.9,
        reviews: 45,
        image: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&auto=format&fit=crop&q=60'
        ],
        specs: { battery: '12V 4.5Ah', mobile_app: false, max_load: '25kg', speed: '3-5 km/h' },
        description: "For the speed enthusiasts! This Ducati replica features hand throttle acceleration.",
        voltage: '12V',
        ageGroup: '3-6'
    },
    {
        id: '4',
        name: 'Mercedes AMG G63 24V',
        category: 'cars',
        subCategory: 'Luxury',
        price: 34999,
        rating: 4.7,
        reviews: 210,
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=60'
        ],
        specs: { battery: '24V 7Ah', mobile_app: true, max_load: '50kg', speed: '5-8 km/h' },
        description: "Luxury meets play. The G63 AMG ride-on is a showstopper with painted finish.",
        voltage: '24V',
        ageGroup: '6-10'
    },
    {
        id: '5',
        name: 'Maverick UTV Buggy',
        category: 'utvs',
        subCategory: 'Buggy',
        price: 45000,
        rating: 4.9,
        reviews: 12,
        image: 'https://images.unsplash.com/photo-1583578768565-385d56b0051e?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1583578768565-385d56b0051e?w=800&auto=format&fit=crop&q=60'
        ],
        tag: 'Beast Mode',
        specs: { battery: '24V 14Ah', mobile_app: true, max_load: '60kg', speed: '10-15 km/h' },
        description: "The ultimate off-road machine for kids. 2-seater, 4x4 drive.",
        voltage: '24V',
        ageGroup: '6-10'
    },
    {
        id: '6',
        name: 'Drift Go-Kart Pro',
        category: 'gokarts',
        subCategory: 'Drift',
        price: 22000,
        rating: 4.6,
        reviews: 56,
        image: 'https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?w=800&auto=format&fit=crop&q=60',
        images: [
            'https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?w=800&auto=format&fit=crop&q=60'
        ],
        specs: { battery: '24V', mobile_app: false, max_load: '45kg', speed: '12 km/h' },
        description: "For the young racer. Special drift wheels for sliding action.",
        voltage: '24V',
        ageGroup: '6-10'
    }
];

// Data Fetching Helper
export async function fetchProducts(): Promise<Product[]> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.from('products').select('*');

        if (error || !data || data.length === 0) {
            console.warn("Supabase fetch failed or empty, using static fallback.", error);
            return products;
        }

        return data.map((item: any) => ({
            id: item.id || item.slug,
            name: item.name,
            category: item.category_id ? 'unknown' : 'cars',
            price: item.base_price,
            rating: item.rating || 0,
            reviews: item.review_count || 0,
            image: item.images?.[0] || '',
            images: item.images || [],
            description: item.description || '',
            tag: item.is_new ? 'New' : (item.is_featured ? 'Featured' : undefined),
            specs: item.specs || {},
            voltage: item.voltage,
            ageGroup: item.age_group,
            subCategory: item.subCategory
        })) as Product[];

    } catch (e) {
        return products;
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
            console.warn("Supabase search failed, falling back to static filter.", error);
            // Make sure we have a fallback if the DB is empty but we want to show *something* for demo purposes
            return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        }

        // If DB returns empty array (valid search but no results), rely on that unless we want to force static data?
        // Let's assume if DB is working we prefer DB. But if DB is empty (length 0) and we suspect it's just unseeded...
        // For now, let's respect the DB result. If it's empty, it's empty. Use fallback only on error or null.

        if (data.length === 0) {
            // Optional: If DB is empty, fallback to static so the user sees results. WDYT?
            // Let's fallback if DB is empty to satisfy the "demo" feeling if they haven't seeded.
            return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        }

        return data.map((item: any) => ({
            id: item.id || item.slug,
            name: item.name,
            category: 'cars',
            price: item.base_price,
            rating: item.rating || 0,
            reviews: item.review_count || 0,
            image: item.images?.[0] || '',
            images: item.images || [],
            description: item.description || '',
            tag: item.is_new ? 'New' : (item.is_featured ? 'Featured' : undefined),
            specs: item.specs || {},
            voltage: item.voltage,
            ageGroup: item.age_group,
            subCategory: item.subCategory
        })) as Product[];

    } catch (e) {
        console.error("Search error:", e);
        return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    }
}
