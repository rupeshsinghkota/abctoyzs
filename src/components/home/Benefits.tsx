import Link from 'next/link';
import { Truck, ShieldCheck, Video, RotateCcw } from 'lucide-react';

const benefits = [
    {
        icon: Truck,
        title: "Free Delivery",
        description: "Pan-India Shipping"
    },
    {
        icon: ShieldCheck,
        title: "1-Year Warranty",
        description: "Motor & Battery"
    },
    {
        icon: RotateCcw,
        title: "10-Day Replacement",
        description: "For damaged items"
    },
    {
        icon: Video,
        title: "Live Showroom Tour",
        description: "Interact before you buy",
        href: "/live-showroom"
    }
];

export function Benefits() {
    return (
        <div className="py-2 md:py-8 relative z-10">
            <div className="container mx-auto px-4">
                <div className="flex overflow-x-auto pb-2 gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 snap-x no-scrollbar">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        const Content = (
                            <div key={index} className="flex-none w-[200px] sm:w-auto snap-center group relative p-[1px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-200 to-transparent overflow-hidden h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative h-full bg-white border border-gray-100 p-2 sm:p-4 rounded-[11px] sm:rounded-[15px] flex flex-row items-center text-left gap-3 sm:gap-4 transition-transform duration-300 group-hover:-translate-y-1 shadow-sm">
                                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                                        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xs sm:text-sm tracking-wide leading-tight">{benefit.title}</h3>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{benefit.description}</p>
                                    </div>
                                    {benefit.href && (
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                            <Video className="w-3 h-3 text-primary animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );

                        return benefit.href ? (
                            <Link key={index} href={benefit.href} className="block flex-none w-[200px] sm:w-auto">
                                {Content}
                            </Link>
                        ) : (
                            <div key={index} className="flex-none w-[200px] sm:w-auto">
                                {Content}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
