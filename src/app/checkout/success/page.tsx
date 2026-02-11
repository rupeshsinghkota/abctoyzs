'use client';

import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag, Loader2 } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OrderService, Order } from '@/lib/services/orders';
import { trackConversion } from '@/components/tracking/GoogleTracking';
import confetti from 'canvas-confetti';

function SuccessContent() {
    const searchParams = useSearchParams();
    const oid = searchParams.get('oid');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            if (!oid) {
                setLoading(false);
                return;
            }
            try {
                const orderData = await OrderService.getOrderById(oid);
                if (orderData) {
                    setOrder(orderData);
                    // TRACK CONVERSION
                    trackConversion(orderData.total_amount, orderData.id);
                }
            } catch (error) {
                console.error("Failed to load order for tracking:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();

        // Trigger confetti animation
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, [oid]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-20 text-center">
            {searchParams.get('new_account') === 'true' ? (
                <SetPasswordForm />
            ) : (
                <>
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>

                    <h1 className="text-3xl font-black font-heading mb-2">Order Confirmed!</h1>
                    <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Retrieving order details...
                            </span>
                        ) : (
                            <>
                                Thank you for your purchase. Your order #{order?.id ? order.id.slice(0, 8).toUpperCase() : `ABC-${Math.floor(Math.random() * 10000)}`} is being processed.
                            </>
                        )}
                    </p>

                    <div className="flex flex-col gap-3 w-full max-w-sm">
                        <Link
                            href="/profile"
                            className="w-full py-3 px-6 rounded-xl bg-muted font-bold text-foreground hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            View Order
                        </Link>
                        <Link
                            href="/"
                            className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

function SetPasswordForm() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                // Remove the query param to show normal success stats
                const params = new URLSearchParams(window.location.search);
                params.delete('new_account');
                router.replace(`${window.location.pathname}?${params.toString()}`);
            }, 2000);
        } catch (error: any) {
            console.error("Failed to set password:", error);
            alert("Failed to set password: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Account Secured!</h2>
                <p className="text-muted-foreground">Redirecting you to your order...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <h2 className="text-2xl font-bold mb-2">One Last Step! 🔐</h2>
            <p className="text-muted-foreground mb-6 text-sm">
                We've created an account for you to track your order. Set a password now so you can log in later.
            </p>

            <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Create Password</label>
                    <input
                        required
                        type="password"
                        placeholder="Min 6 characters"
                        minLength={6}
                        className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Secure My Account"}
                </button>
            </form>
            <button
                type="button"
                onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('new_account');
                    router.replace(`${window.location.pathname}?${params.toString()}`);
                }}
                className="w-full mt-4 text-xs text-muted-foreground hover:underline text-center"
            >
                Skip for now (I'll set it later)
            </button>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
