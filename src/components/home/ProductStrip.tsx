import Link from 'next/link';
import { ProductCard } from '@/components/shop/ProductCard';
import { HorizontalScroll } from '@/components/ui/HorizontalScroll';

interface ProductStripProps {
    title: string;
    products: any[];
    viewAllLink?: string;
}

export function ProductStrip({ title, products, viewAllLink = '/shop' }: ProductStripProps) {
    return (
        <section className="py-6 bg-background space-y-4">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-lg font-bold font-heading tracking-tight">{title}</h3>
                <Link href={viewAllLink} className="text-sm font-medium text-primary hover:underline">
                    View All
                </Link>
            </div>

            <HorizontalScroll>
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        className="flex-none w-[200px] md:w-[240px] lg:w-[260px] snap-start"
                    />
                ))}
            </HorizontalScroll>
        </section>
    );
}
