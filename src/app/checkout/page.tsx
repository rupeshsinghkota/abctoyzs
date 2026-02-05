"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ProfileService, Address } from '@/lib/services/profile';
import { OrderService } from '@/lib/services/orders';
import { ShiprocketService, ShiprocketRate } from '@/lib/services/shiprocket';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, MapPin, Plus, Check, Truck, CreditCard,
    Banknote, Loader2, ShieldCheck, Package, ChevronRight, User
} from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useStore();
    const [loading, setLoading] = useState(false);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Shiprocket Fast Checkout will calculate shipping; initially show 0 or "Calculated at next step"
    const shipping = 0;
    const total = subtotal + shipping;

    // This function triggers the actual Shiprocket Checkout Session
    const triggerShiprocketCheckout = async () => {
        setLoading(true);
        try {
            console.log("Initiating Shiprocket Session...");
            const session = await ShiprocketService.createSession({
                cart_data: {
                    items: cart.map(item => ({
                        variant_id: String(item.id), // Ensure string
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
            });

            console.log("Shiprocket Session Created:", session);

            if (session.result && session.result.token) {
                const token = session.result.token;
                console.log("Token Received:", token);

                // HEADLESS FLOW:
                if (typeof (window as any).Shiprocket !== 'undefined') {
                    (window as any).Shiprocket.checkout({
                        token: token
                    });
                } else {
                    console.warn("Shiprocket Script not loaded.");
                    alert(`Session Token: ${token}\n\nWaiting for Shiprocket Script... (Not found on window)`);
                }
            } else {
                console.warn("Unexpected Response:", session);
                alert("Session created but no token found.");
            }

        } catch (error: any) {
            console.error("Checkout Error:", error);
            // Handle specific 401 cleanly
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
        <div className="min-h-screen pb-40 lg:pb-12 bg-background">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
                <Link href="/cart" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">Checkout</h1>
            </div>

            <div className="p-4 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Fast Checkout Info */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Hero / Info Section */}
                        <div className="bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/20 rounded-2xl p-6 text-center lg:text-left flex flex-col lg:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center p-3">
                                <img src="https://sr-cdn.shiprocket.in/sr-assets/images/shiprocket-logo.svg" alt="Shiprocket" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold mb-2">Express Checkout</h2>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>Secure OTP Login</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>Auto-filled Delivery Address</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>Fast & Reliable Shipping</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Mobile Order Summary */}
                        <div className="lg:hidden">
                            <OrderSummaryCard cart={cart} subtotal={subtotal} total={total} shipping={shipping} />
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-card border rounded-xl flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="font-bold text-sm">100% Secure</p>
                                    <p className="text-xs text-muted-foreground">Payments protected</p>
                                </div>
                            </div>
                            <div className="p-4 bg-card border rounded-xl flex items-center gap-3">
                                <Truck className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="font-bold text-sm">Fast Delivery</p>
                                    <p className="text-xs text-muted-foreground">Across India</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary & Action */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <OrderSummaryCard cart={cart} subtotal={subtotal} total={total} shipping={shipping} />

                            <div className="p-4 bg-muted/30 rounded-xl text-center">
                                <p className="text-sm text-muted-foreground mb-4">Complete your order securely with Shiprocket</p>
                                <button
                                    onClick={triggerShiprocketCheckout}
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all shadow-primary/25"
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <button
                    onClick={triggerShiprocketCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Complete Order • ₹{total.toLocaleString()}
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
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
