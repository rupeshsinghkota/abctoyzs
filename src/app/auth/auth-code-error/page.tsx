"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-zinc-100">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black text-zinc-900 mb-2">Authentication Failed</h1>
                <p className="text-zinc-500 mb-8">
                    We couldn't verify your email link. This usually happens if the link has expired or has already been used.
                </p>
                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="block w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                        Return to Login
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 bg-zinc-100 text-zinc-900 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
