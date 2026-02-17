import { Product } from "@/lib/data";

interface CategorySchemaProps {
    categoryName: string;
    products: Product[];
}

export function CategorySchema({ categoryName, products }: CategorySchemaProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `${categoryName} Collection - ABC Toyz`,
        "description": `Explore our premium collection of ${categoryName.toLowerCase()} ride-on toys at ABC Toyz India.`,
        "numberOfItems": products.length,
        "itemListElement": products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://abctoyz.in/product/${product.slug || product.id}`,
            "name": product.name,
            "image": product.images?.[0] || product.image,
            "description": product.description?.replace(/<[^>]*>/g, '').slice(0, 160)
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
