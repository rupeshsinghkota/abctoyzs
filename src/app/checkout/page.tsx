"use client";

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ProfileService, Address } from '@/lib/services/profile';
import { OrderService } from '@/lib/services/orders';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, MapPin, Plus, Check, Truck, CreditCard,
    Banknote, Loader2, ShieldCheck, Package, ChevronRight, User
} from 'lucide-react';
import { OrderSummaryCard } from '@/components/cart/OrderSummaryCard';

declare global {
    interface Window {
        Razorpay: any;
        Shiprocket: any; // Added for Shiprocket Fast Checkout
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart } = useStore(); // Removed clearCart
    const [loading, setLoading] = useState(false);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Shiprocket Fast Checkout will calculate shipping; initially show 0 or "Calculated at next step"
    const shipping = 0;
    const total = subtotal + shipping;

    const handleFastCheckout = async () => {
        setLoading(true);
        try {
            console.log("Initiating Shiprocket Session...");
            const res = await fetch('/api/shiprocket/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart_data: {
                        items: cart.map(item => ({
                            variant_id: String(item.id),
                            quantity: Number(item.quantity),
                            catalog_data: {
                                price: Number(item.price),
                                name: String(item.name || 'Product'),
                                image_url: item.image ? String(item.image) : undefined
                            }
                        }))
                    },
                    redirect_url: window.location.origin + '/checkout/success?oid=',
                    timestamp: new Date().toISOString()
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to start session");
            }

            const session = await res.json();

            if (session.result && session.result.token) {
                const token = session.result.token;
                if (typeof (window as any).Shiprocket === 'undefined') {
                    const script = document.createElement('script');
                    script.src = "https://fast-checkout.shiprocket.in/assets/js/shiprocket_checkout.js";
                    script.async = true;
                    script.onload = () => { (window as any).Shiprocket.checkout({ token }); };
                    document.body.appendChild(script);
                } else {
                    (window as any).Shiprocket.checkout({ token });
                }
            } else {
                alert("Session created but no token found.");
            }

        } catch (error: any) {
            console.error("Checkout Error:", error);
            if (error.message.includes("401")) {
                alert("Authentication Failed. Please check API Keys in Vercel.");
            } else {
                alert(`Failed to start checkout: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Add items to cart before checkout</p>
                <Link href="/" className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-0">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/cart" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg">Checkout</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-5xl">
                <div className="grid lg:grid-cols-[1fr,380px] gap-8">
                    {/* Left Column: Information */}
                    <div className="space-y-6">

                        {/* Information Banner */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                            <h2 className="font-bold text-lg text-blue-900 mb-2">Checkout Update</h2>
                            <p className="text-sm text-blue-700">
                                We are currently upgrading our checkout experience to bring you faster shipping and secure payments.
                            </p>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="space-y-6">
                        <OrderSummaryCard
                            cart={cart}
                            subtotal={subtotal}
                            total={total}
                            shipping={shipping}
                        />

                        <div className="sticky bottom-0 lg:static p-4 lg:p-0 bg-background lg:bg-transparent border-t lg:border-t-0 -mx-4 lg:mx-0 shadow-lg lg:shadow-none">
                            <button
                                onClick={handleFastCheckout}
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground h-14 rounded-full font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Complete Order
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Secure Checkout with Shiprocket
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function OrderSummaryCard({ cart, subtotal, total, shipping }: { cart: any[], subtotal: number, total: number, shipping: number }) {
    return (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    3
                </div>
                <h2 className="font-bold">Order Summary</h2>
            </div>

            <div className="p-4 space-y-4">
                <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 mb-4 last:mb-0">
                            <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0 border">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm line-clamp-2 leading-tight">{item.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    <p className="font-bold text-sm text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4 space-y-2 text-sm lg:text-base">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                            {shipping === 0 ? "Free" : `₹${shipping}`}
                        </span>
                    </div>
                    <div className="flex justify-between text-xl font-black pt-3 border-t">
                        <span>Total</span>
                        <span className="text-primary">₹{total.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
