import Link from "next/link";
import { MoveLeft, Home, ShoppingBag, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <p className="text-base font-semibold text-primary">404</p>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Oops! Page Not Found
                </h1>
                <p className="mt-6 text-base leading-7 text-muted-foreground max-w-lg mx-auto">
                    It seems the page you are looking for has been moved, deleted, or never existed in the first place.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <Link
                        href="/category"
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white border border-input px-8 py-3.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/50 transition-all active:scale-95 gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Shop All Toys
                    </Link>
                </div>

                <div className="mt-16">
                    <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest font-outfit">
                        Popular Categories
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {[
                            { name: "Electric Cars", href: "/category/electric-cars" },
                            { name: "Electric Bikes", href: "/category/electric-bikes" },
                            { name: "Remote Control", href: "/category/remote-control" },
                            { name: "Educational", href: "/category/educational" },
                        ].map((category) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                className="p-4 rounded-2xl bg-accent/30 border border-primary/5 hover:border-primary/20 transition-all text-sm font-medium hover:text-primary"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full max-w-4xl opacity-20 blur-3xl pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full" />
            </div>
        </div>
    );
}
