import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

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
        '/category/cars',
        '/category/bikes',
        '/category/jeeps',
        '/category/atvs',
        '/category/scooters',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
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

    return [...routes, ...productRoutes];
}
