'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity } = useStore();
    const router = useRouter();
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    const handleCheckout = () => {
        router.push('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center pb-20">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <Link
                    href="/"
                    className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-8 bg-background md:pb-0">
            <div className="p-4 md:container md:mx-auto md:py-8 md:flex md:gap-8 md:items-start">

                {/* Cart Items */}
                <div className="space-y-4 md:w-2/3">
                    <h1 className="text-2xl font-bold font-heading mb-6 hidden md:block">Shopping Cart</h1>
                    {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 bg-card border rounded-2xl shadow-sm">
                            <div className="relative w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-sm md:text-base line-clamp-2">{item.name}</h3>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-muted-foreground hover:text-destructive p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-primary font-bold mt-1">₹{item.price.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center border rounded-lg bg-background">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="p-1 px-2 hover:bg-muted disabled:opacity-50"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 px-2 hover:bg-muted"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="mt-8 md:mt-0 md:w-1/3 bg-card border rounded-2xl p-6 shadow-sm sticky md:top-24">
                    <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="text-green-600 font-medium">Free</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-base font-bold">
                            <span>Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full mt-6 py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-dashed text-center">
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                            <Truck className="w-4 h-4" />
                            Free delivery on all orders!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
