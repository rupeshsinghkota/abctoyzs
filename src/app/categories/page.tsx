import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Car, Bike, Truck, Gamepad2, Sparkles, LayoutGrid } from 'lucide-react';

const categories = [
    {
        slug: 'cars',
        name: 'Cars',
        description: 'Premium electric ride-on cars',
        icon: Car,
        color: 'from-blue-500 to-indigo-600'
    },
    {
        slug: 'bikes',
        name: 'Bikes',
        description: 'Electric motorcycles & bikes',
        icon: Bike,
        color: 'from-orange-500 to-red-600'
    },
    {
        slug: 'jeeps',
        name: 'Jeeps & SUVs',
        description: 'Off-road adventure vehicles',
        icon: Truck,
        color: 'from-green-500 to-emerald-600'
    },
    {
        slug: 'gokarts',
        name: 'Go-Karts',
        description: 'Racing go-karts for thrills',
        icon: Gamepad2,
        color: 'from-purple-500 to-pink-600'
    },
    {
        slug: 'new',
        name: 'New Arrivals',
        description: 'Latest additions to our collection',
        icon: Sparkles,
        color: 'from-amber-500 to-orange-600'
    },
    {
        slug: 'all',
        name: 'All Products',
        description: 'Browse our complete collection',
        icon: LayoutGrid,
        color: 'from-gray-600 to-gray-800'
    },
];

export default function CategoriesPage() {
    return (
        <div className="min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 pt-2">
                <Breadcrumb items={[{ label: 'Categories' }]} />
            </div>

            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl md:text-3xl font-bold font-heading">Browse Categories</h1>
                <p className="text-muted-foreground mt-1">Find the perfect ride-on toy for your child</p>
            </div>

            {/* Categories Grid */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.slug}
                                href={`/category/${category.slug}`}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br aspect-square flex flex-col items-center justify-center text-white p-4 transition-all hover:scale-[1.02] hover:shadow-xl"
                                style={{
                                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`
                                }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
                                <div className="relative z-10 text-center">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h2 className="font-bold text-lg">{category.name}</h2>
                                    <p className="text-xs text-white/80 mt-1 line-clamp-2">{category.description}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
