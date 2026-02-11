"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
            <div className="w-full max-w-md bg-white border border-zinc-100 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary/50"></div>

                <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 mb-8 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>

                {success ? (
                    <div className="animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight">Check your email</h2>
                        <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
                            We've sent a password reset link to <br /><span className="text-zinc-900 font-bold bg-zinc-100 px-2 py-0.5 rounded-lg">{email}</span>
                        </p>
                        <Link
                            href="/login"
                            className="block w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-200"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                            <span className="text-3xl">🔑</span>
                        </div>
                        <h1 className="text-3xl font-black font-heading text-zinc-900 tracking-tight mb-3">Forgot Password?</h1>
                        <p className="text-zinc-500 font-medium mb-8 leading-relaxed text-sm">
                            Don't worry! It happens. Please enter the email address linked with your account.
                        </p>

                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-3 text-left">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 text-left">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-zinc-900 text-white font-black rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none shadow-xl shadow-zinc-200"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Send Reset Code'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
