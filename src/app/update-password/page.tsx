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

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
                <div className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-sm text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
                    <p className="text-muted-foreground mb-4">
                        Your password has been changed successfully. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
            <div className="w-full max-w-sm bg-card border rounded-2xl p-6 shadow-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black font-heading">Set New Password</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Type in your new password below.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Min 6 characters"
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
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
