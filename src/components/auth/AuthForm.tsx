"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { z } from 'zod';

const authSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

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

        // Validation
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
            setError(validation.error.issues[0].message);
            setLoading(false);
            return;
        }

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`, // Remove specific next param for generic signup, let callback handle defaults
                    },
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    // Friendly error message
                    if (error.message.includes("Invalid login")) {
                        throw new Error("Incorrect email or password");
                    }
                    throw error;
                }

                // Check if user is admin for auto-redirect
                const { data: adminCheck } = await supabase
                    .from('admins')
                    .select('user_id')
                    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
                    .single();

                router.refresh(); // Refresh server components

                if (adminCheck) {
                    router.push('/admin');
                } else {
                    router.push(nextUrl);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row overflow-hidden rounded-[2.5rem] shadow-2xl bg-white border border-zinc-100 min-h-[600px]">
            {/* Left Side - Visual & Brand */}
            <div className="hidden md:flex md:w-1/2 bg-zinc-950 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="relative z-10 text-white max-w-md">
                    <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
                        Playing is <br />
                        <span className="text-primary italic">Learning.</span>
                    </h2>
                    <p className="text-zinc-300 text-lg font-medium leading-relaxed mb-8">
                        Join the ABC Toyz family today. Unlock exclusive deals, track your orders easier, and get early access to new premium rides.
                    </p>
                    <div className="flex items-center gap-4 text-sm font-bold text-zinc-400">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-xs">
                                    👾
                                </div>
                            ))}
                        </div>
                        <p>Join 10,000+ happy parents</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
                <div className="max-w-sm mx-auto w-full">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black font-heading text-zinc-900 tracking-tight mb-3">
                            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            {mode === 'login'
                                ? 'Enter your details to access your account'
                                : 'Start your journey with us today'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-600 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-zinc-300"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Password</label>
                                {mode === 'login' && (
                                    <Link href="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-zinc-300"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-900 text-white font-black rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none shadow-xl shadow-zinc-200"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                mode === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-zinc-500">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => {
                                    setMode(mode === 'login' ? 'signup' : 'login');
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="text-zinc-900 font-black hover:text-primary transition-colors underline decoration-2 decoration-zinc-200 underline-offset-4 hover:decoration-primary"
                            >
                                {mode === 'login' ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
