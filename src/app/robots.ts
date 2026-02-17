import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/profile/orders/invoice/*'],
        },
        sitemap: 'https://abctoyz.in/sitemap.xml',
    };
}
