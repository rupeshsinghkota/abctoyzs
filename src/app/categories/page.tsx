import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Car, Bike, Truck, Gamepad2, Sparkles, LayoutGrid, Zap, User } from 'lucide-react';
import { VEHICLE_CATEGORIES, POWER_CATEGORIES, AGE_CATEGORIES } from '@/lib/data';

// Map icons to categories
const ICON_MAP: Record<string, any> = {
    cars: Car,
    bikes: Bike,
    jeeps: Truck,
    gokarts: Gamepad2,
    atvs: Truck,
    utvs: Truck,
    scooters: Bike,
    default: LayoutGrid
};

export default function CategoriesPage() {
    return (
        <div className="min-h-screen pb-24 md:pb-20 bg-background">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 pt-2">
                <Breadcrumb items={[{ label: 'Categories' }]} />
            </div>

            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl md:text-3xl font-bold font-heading">Browse Categories</h1>
                <p className="text-muted-foreground mt-1">Find the perfect ride-on toy by type, power, or age.</p>
            </div>

            <div className="container mx-auto px-4 space-y-10">

                {/* 1. Vehicle Types */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <LayoutGrid className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold">Vehicle Types</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {VEHICLE_CATEGORIES.map((cat) => {
                            const Icon = ICON_MAP[cat.value] || ICON_MAP.default;
                            return (
                                <Link
                                    key={cat.value}
                                    href={`/category/${cat.value}`}
                                    className="group relative overflow-hidden rounded-xl bg-muted/30 border hover:border-primary/50 transition-all hover:shadow-lg p-4 flex flex-col items-center justify-center gap-3 aspect-[4/3]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold text-center text-sm md:text-base">{cat.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* 2. By Power */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-xl font-bold">Shop by Power</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {POWER_CATEGORIES.map((power) => (
                            <Link
                                key={power.value}
                                href={`/category/power/${power.value}`}
                                className="group p-5 rounded-xl border bg-gradient-to-br from-background to-muted hover:border-yellow-500/50 hover:shadow-md transition-all flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold text-lg flex-shrink-0">
                                    {power.label.split(' ')[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-yellow-600 transition-colors">{power.label}</h3>
                                    <p className="text-xs text-muted-foreground">{power.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 3. By Age */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold">Shop by Age</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3 md:gap-6">
                        {AGE_CATEGORIES.map((age) => (
                            <Link
                                key={age.value}
                                href={`/category/age/${age.value}`}
                                className="group relative overflow-hidden rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 hover:border-blue-500 hover:shadow-md transition-all p-4 flex flex-col items-center justify-center gap-2"
                            >
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    {age.label.match(/\((.*?)\)/)?.[1] || age.value}
                                </span>
                                <span className="text-xs font-medium text-center text-muted-foreground uppercase tracking-wide">
                                    Years
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
