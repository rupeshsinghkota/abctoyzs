'use client';

import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function CheckoutSuccessPage() {

    useEffect(() => {
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
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pb-20 text-center">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-3xl font-black font-heading mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                Thank you for your purchase. Your order #ABC-{Math.floor(Math.random() * 10000)} is being processed.
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
        </div>
    );
}
