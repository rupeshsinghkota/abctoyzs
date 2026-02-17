'use client';

import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { Loader2 } from 'lucide-react';

function AuthFormFallback() {
    return (
        <div className="w-full max-w-sm mx-auto p-6 bg-card border rounded-2xl shadow-sm flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen py-10 md:py-20 flex items-center justify-center bg-zinc-50/50 px-4">
            <Suspense fallback={<AuthFormFallback />}>
                <AuthForm />
            </Suspense>
        </div>
    );
}
