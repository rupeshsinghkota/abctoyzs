'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, ShieldCheck, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { mapToGA4Item, trackEvent } from '@/components/tracking/GoogleTracking';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity } = useStore();
    const router = useRouter();
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        // Track GA4 view_cart
        if (cart.length > 0) {
            trackEvent("view_cart", {
                currency: "INR",
                value: subtotal,
                items: cart.map(mapToGA4Item)
            });
        }
    }, []);

    const handleCheckout = () => {

        router.push('/checkout');
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
            </div>
        );
    }

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
        <div className="min-h-screen pb-32 bg-gray-50/50 md:pb-0">
            <div className="p-4 md:container md:mx-auto md:py-8 md:flex md:gap-8 md:items-start">

                {/* Cart Items */}
                <div className="space-y-4 md:w-2/3">
                    <h1 className="text-2xl font-bold font-heading mb-6 hidden md:block">Shopping Cart</h1>
                    {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 p-5 bg-white border border-gray-100 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                            <div className="relative w-24 h-24 bg-gray-50 rounded-[18px] overflow-hidden shrink-0 border border-gray-100">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <div className="flex justify-between items-start gap-3 md:gap-4">
                                        <h3 className="font-bold text-xs md:text-sm line-clamp-2 text-gray-900 leading-snug">{item.name}</h3>
                                        <button
                                            onClick={() => {
                                                trackEvent('remove_from_cart', {
                                                    currency: 'INR',
                                                    value: item.price * item.quantity,
                                                    items: [mapToGA4Item(item)]
                                                });
                                                removeFromCart(item.id);
                                            }}
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 -mr-2 -mt-2 rounded-full transition-all shrink-0"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                    </div>
                                    <div className="flex flex-col mt-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-black font-black text-base md:text-lg">₹{item.price.toLocaleString()}</p>
                                            {(item.regularPrice || item.mrp) && (item.regularPrice || item.mrp)! > item.price && (
                                                <p className="text-gray-400 text-[10px] md:text-[11px] line-through font-bold">
                                                    ₹{(item.regularPrice || item.mrp)?.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        {(item.regularPrice || item.mrp) && (item.regularPrice || item.mrp)! > item.price && (
                                            <p className="text-green-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-0.5">
                                                You Save ₹{(((item.regularPrice || item.mrp)!) - item.price).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-3">
                                    <div className="flex items-center border border-gray-200 rounded-full bg-white h-9">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 rounded-l-full disabled:opacity-30 transition-colors"
                                        >
                                            <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                                        </button>
                                        <span className="text-xs md:text-sm font-black w-8 text-center text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 rounded-r-full transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>

                {/* Order Summary */}
                <div className="mt-8 md:mt-0 md:w-1/3 bg-white border border-gray-100 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:sticky lg:top-24">
                    <h3 className="text-lg lg:text-xl font-black text-gray-900 mb-6 tracking-tight">Order Summary</h3>
                    <div className="space-y-4 text-xs md:text-sm">
                        <div className="flex justify-between items-center text-gray-500 font-medium">
                            <span>Subtotal ({cart.length} items)</span>
                            <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500 font-medium">
                            <span>Shipping</span>
                            <span className="text-green-600 font-black tracking-widest uppercase text-xs">Free</span>
                        </div>

                        <div className="h-px w-full bg-gray-100 my-4" />

                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="font-black text-xl md:text-2xl tracking-tighter text-gray-900 leading-none">Total</span>
                                <span className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Incl. of all taxes</span>
                            </div>
                            <div className="flex justify-between items-center text-lg lg:text-xl font-black text-gray-900 border-t border-gray-100 pt-5 mt-4">
                                <span className="tracking-tight">Grand Total</span>
                                <span className="text-primary tracking-tighter">₹{subtotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* LIVE VIDEO CTA NUDGE */}
                        {subtotal >= 4999 && (
                            <div className="my-6 p-5 bg-zinc-950 rounded-[28px] border border-white/5 space-y-3 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-primary/10 blur-2xl rounded-full" />
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Showroom Assist</span>
                                </div>
                                <h4 className="text-xs font-black text-white tracking-tight uppercase">Unsure about the size or quality?</h4>
                                <p className="text-[11px] font-medium text-zinc-400 leading-relaxed italic">
                                    "See these items live on video before we ship them to your doorstep."
                                </p>
                                <Link
                                    href="/category/all"
                                    className="flex items-center justify-between w-full px-4 py-3 bg-zinc-900 border border-white/5 text-xs font-black text-white rounded-xl hover:bg-zinc-800 transition-all group/btn shadow-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <Video className="w-4 h-4 text-primary" strokeWidth={3} />
                                        <span className="uppercase tracking-widest">Book Live Tour</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover/btn:translate-x-1 group-hover/btn:text-primary transition-all" />
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => router.push('/checkout')}
                            className="w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-xl lg:rounded-2xl font-black text-xs md:text-sm tracking-widest uppercase shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                        >
                            Secure Checkout <ArrowRight className="w-4 h-4" />
                        </button>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 rounded-xl border border-green-100">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">100% Secure Checkout</span>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guaranteed Safe Payments</p>
                                <div className="flex items-center justify-center gap-2 flex-wrap opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                                    <span className="bg-white border border-gray-100 rounded-md px-1.5 py-0.5 text-[9px] font-black text-gray-700">💵 COD</span>
                                    <span className="bg-white border border-gray-100 rounded-md px-1.5 py-0.5 text-[9px] font-black text-gray-700">UPI</span>
                                    <span className="bg-white border border-gray-100 rounded-md px-1.5 py-0.5 text-[9px] font-black text-[#2B85FF]">Razorpay</span>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-2.5" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                                </div>
                            </div>

                            <p className="text-[10px] text-center font-bold text-gray-500 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                                <Truck className="w-3.5 h-3.5 text-primary" />
                                Free Delivery Pan-India
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Button */}
                <div className="lg:hidden fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
                    <button
                        onClick={handleCheckout}
                        className="w-full bg-black text-white h-14 rounded-[20px] font-black text-base shadow-xl shadow-black/20 active:scale-[0.98] transition-transform flex items-center justify-between px-6"
                    >
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total</span>
                            <span className="text-lg md:text-xl tracking-tight">₹{total.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            Checkout <ArrowRight className="w-5 h-5" />
                        </div>
                    </button>
                    <p className="text-[10px] text-center font-bold text-gray-500 mt-3 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                        100% Secure Checkout
                    </p>
                </div>
            </div>
        </div>
    );
}
