import { Product } from "@/lib/data";

export function ProductSchema({ product }: { product: Product }) {
    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [product.image],
        "description": product.description,
        "brand": {
            "@type": "Brand",
            "name": "ABC TOYZ"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://abctoyz.com/product/${product.id}`,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviews
        }
        // Potential additions: model, dimensions, etc.
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
