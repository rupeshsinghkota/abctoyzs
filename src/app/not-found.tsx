import Link from "next/link";
import { Home, Search, CarFront, AlertTriangle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: '404 - Wrong Turn | ABC Toyz',
    description: 'Looks like you took a wrong turn. Return to the garage to find the best ride-on cars for your little one.',
    robots: {
        index: false,
        follow: true,
    }
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-200/50 rounded-full blur-3xl" />
            </div>

            <div className="max-w-lg w-full text-center space-y-8 relative z-10">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl rounded-full scale-110" />

                    <div className="relative w-40 h-40 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-zinc-200/50 border border-zinc-100 rotate-3 transition-transform hover:rotate-6 duration-700">
                        <CarFront className="w-16 h-16 text-zinc-300" strokeWidth={1.5} />
                        <div className="absolute -bottom-2 -right-2 bg-red-100 text-red-600 p-3 rounded-2xl border border-red-200 shadow-sm">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-8xl font-black text-zinc-900 tracking-tighter opacity-10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full -z-10">
                        404
                    </h1>
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Wrong Turn!</h2>
                    <p className="text-zinc-500 text-lg leading-relaxed max-w-sm mx-auto">
                        This track leads to a dead end. Let's get you back to the showroom or the main garage.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
                    <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-900/20 group"
                    >
                        <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                        Back to Garage
                    </Link>
                    <Link
                        href="/category/all"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-2xl font-bold hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100 transition-all shadow-sm group"
                    >
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Find a Ride
                    </Link>
                </div>

                <div className="pt-12">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Error Code 404 • Page Not Found
                    </p>
                </div>
            </div>
        </div>
    );
}
