import Link from "next/link";
import { Home, Search, Ghost } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist. Return to the ABC Toyz homepage to explore our premium ride-on collection.',
    robots: {
        index: false,
        follow: true,
    }
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 transform -translate-y-4" />
                    <Ghost className="w-32 h-32 text-zinc-900 animate-bounce relative z-10 mx-auto" strokeWidth={1} />
                    <p className="text-8xl font-black text-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none tracking-tighter">404</p>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Oops! Lost in the Playground?</h1>
                    <p className="text-zinc-500 text-lg leading-relaxed">
                        We couldn't find the page you're looking for. It might have drifted away or taken a wrong turn.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-zinc-200"
                    >
                        <Home className="w-5 h-5" />
                        Back to Safety
                    </Link>
                    <Link
                        href="/category/all"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-2xl font-bold hover:bg-zinc-50 transition-all shadow-sm"
                    >
                        <Search className="w-5 h-5" />
                        Explore Toys
                    </Link>
                </div>

                <div className="pt-8 border-t border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Need help? <Link href="/contact-us" className="text-primary hover:underline">Contact Support</Link></p>
                </div>
            </div>
        </div>
    );
}
