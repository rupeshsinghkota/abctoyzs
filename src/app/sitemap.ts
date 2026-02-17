import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { VEHICLE_CATEGORIES } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://abctoyz.in';
    const supabase = await createClient();

    // Static pages
    const routes = [
        '',
        '/about-us',
        '/contact-us',
        '/privacy-policy',
        '/terms-of-service',
        '/refund-policy',
        '/shipping-policy',
        '/warranty-policy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Category Pages
    const categoryRoutes = VEHICLE_CATEGORIES.map((category) => ({
        url: `${baseUrl}/category/${category.value}`,
        lastModified: new Date(), // Categories update when products change, simpler to set to now
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    // Dynamic Product pages
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at');

    const productRoutes = (products || []).map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(product.updated_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    return [...routes, ...categoryRoutes, ...productRoutes];
}
