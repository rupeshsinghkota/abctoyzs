'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-zinc-50">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>

            <h1 className="text-3xl font-black text-zinc-900 mb-2">Something went wrong!</h1>
            <p className="text-zinc-500 max-w-md mb-8">
                We apologize for the inconvenience. An unexpected error occurred while loading this page.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:shadow-lg transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-2xl hover:bg-zinc-50 transition-all"
                >
                    <Home className="w-5 h-5" />
                    Go Home
                </Link>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 p-4 bg-red-50 border border-red-100 rounded-xl text-left overflow-auto max-w-2xl w-full">
                    <p className="text-xs font-mono text-red-600 uppercase mb-2 font-bold">Error Details (Dev Only):</p>
                    <p className="text-sm font-mono text-red-800 break-words">{error.message}</p>
                    {error.digest && <p className="text-xs text-red-400 mt-2 font-mono">Digest: {error.digest}</p>}
                </div>
            )}
        </div>
    );
}
