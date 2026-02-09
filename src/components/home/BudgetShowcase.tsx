'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/data';
import { ArrowRight, Star } from 'lucide-react';

const BudgetColumn = ({ title, products, link, color }: { title: string, products: Product[], link: string, color: string }) => (
    <div className={`flex flex-col gap-4 p-4 rounded-3xl ${color} h-full`}>
        <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xl font-black text-zinc-900">{title}</h3>
            <Link href={link} className="p-2 bg-white rounded-full hover:bg-black hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

        <div className="flex flex-col gap-3">
            {products.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`} className="flex gap-4 p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                    <div className="relative w-20 h-20 bg-zinc-50 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                        <h4 className="font-bold text-sm text-zinc-900 truncate group-hover:text-amber-600 transition-colors">{product.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-amber-500 my-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="font-bold text-zinc-600">{product.rating}</span>
                            <span className="text-zinc-400">({product.reviews})</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-zinc-900">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.mrp && <span className="text-xs text-zinc-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>}
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        <Link href={link} className="mt-auto pt-4 text-center text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity">
            View All Products
        </Link>
    </div>
);

export function BudgetShowcase({ products }: { products: Product[] }) {
    if (!products || products.length === 0) return null;

    const budget = products.filter(p => p.price < 10000).slice(0, 3);
    const mid = products.filter(p => p.price >= 10000 && p.price <= 20000).slice(0, 3);
    const premium = products.filter(p => p.price > 20000).slice(0, 3);

    return (
        <section className="py-8 px-4 container mx-auto">
            <h2 className="text-2xl font-black mb-8 px-2">Shop By Budget</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <BudgetColumn
                    title="Under ₹10,000"
                    products={budget}
                    link="/category/price/under-10k"
                    color="bg-blue-50/50 border border-blue-100"
                />
                <BudgetColumn
                    title="₹10k - ₹20k"
                    products={mid}
                    link="/category/price/10k-20k"
                    color="bg-zinc-100/80 border border-zinc-200"
                />
                <BudgetColumn
                    title="Above ₹20,000"
                    products={premium}
                    link="/category/price/above-20k"
                    color="bg-amber-50/50 border border-amber-100"
                />
            </div>
        </section>
    );
}
