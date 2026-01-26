"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AuthFormProps {
    view?: 'login' | 'signup';
}

export function AuthForm({ view = 'login' }: AuthFormProps) {
    const [mode, setMode] = useState<'login' | 'signup'>(view);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get('next') || '/profile';

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback?next=${nextUrl}`,
                    },
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.refresh(); // Refresh server components
                router.push(nextUrl);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto p-6 bg-card border rounded-2xl shadow-sm">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black font-heading">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                    {mode === 'login'
                        ? 'Enter your credentials to access your account'
                        : 'Join abcToyz for exclusive deals and faster checkout'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {message && (
                <div className="mb-6 p-3 rounded-lg bg-green-50 text-green-700 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Password</label>
                        {mode === 'login' && (
                            <Link href="/forgot-password" className="text-xs text-primary font-medium hover:underline">
                                Forgot?
                            </Link>
                        )}
                    </div>
                    <input
                        type="password"
                        required
                        className="w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        mode === 'login' ? 'Sign In' : 'Sign Up'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                    onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login');
                        setError(null);
                        setMessage(null);
                    }}
                    className="text-primary font-bold hover:underline"
                >
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
            </div>
        </div>
    );
}
