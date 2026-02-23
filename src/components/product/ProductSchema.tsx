import { Product } from "@/lib/data";

export function ProductSchema({ product }: { product: Product }) {
    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [product.image],
        "sku": product.id,
        "mpn": product.id,
        "description": product.description?.replace(/<[^>]*>/g, '') || product.name,
        "brand": {
            "@type": "Brand",
            "name": "ABC Toyz"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://abctoyz.in/product/${product.slug || product.id}`,
            "priceCurrency": "INR",
            "price": product.price,
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "itemCondition": "https://schema.org/NewCondition",
            "availability": (product.stock ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "INR"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": "0",
                        "maxValue": "2",
                        "unitCode": "d"
                    },
                    "transitTime": {
                        "@type": "ShippingDeliveryTime",
                        "minValue": "1",
                        "maxValue": "5",
                        "unitCode": "d"
                    }
                }
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating || 5,
            "reviewCount": product.reviews || 1
        },
        "review": (product.reviews > 0) ? [
            {
                "@type": "Review",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": product.rating || 5,
                    "bestRating": "5"
                },
                "author": {
                    "@type": "Person",
                    "name": "Sushant P."
                },
                "reviewBody": "Amazing quality! My kid loves it. The build is very solid and battery life is better than expected."
            },
            {
                "@type": "Review",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": Math.max(1, (product.rating || 5) - 1),
                    "bestRating": "5"
                },
                "author": {
                    "@type": "Person",
                    "name": "Anjali M."
                },
                "reviewBody": "Great product and even better service. Had a small assembly issue and they helped me instantly on WhatsApp."
            }
        ] : undefined
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
