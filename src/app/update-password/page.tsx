"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Link invalid or expired
                setError("This link is invalid or expired. Please request a new one.");
                setCheckingSession(false);
                // Optionally redirect
                // router.push('/forgot-password'); 
            } else {
                setCheckingSession(false);
            }
        };
        checkSession();
    }, []);

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
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

                {success ? (
                    <div className="animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">Password Updated!</h2>
                        <p className="text-zinc-500 font-medium mb-8">
                            Your password has been changed successfully.<br /> Redirecting you to login...
                        </p>
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-[progress_3s_ease-in-out_forwards] w-full origin-left"></div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                            <span className="text-3xl">🔒</span>
                        </div>
                        <h1 className="text-3xl font-black font-heading text-zinc-900 tracking-tight mb-3">Set New Password</h1>
                        <p className="text-zinc-500 font-medium mb-8 leading-relaxed text-sm">
                            Create a strong password that you haven't used before.
                        </p>

                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-3 text-left">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-zinc-300"
                                    placeholder="Min 6 characters"
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
                                    'Update Password'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
