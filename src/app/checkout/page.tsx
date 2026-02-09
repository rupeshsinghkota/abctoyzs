"use client";

import { useState, useEffect } from 'react';
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


declare global {
    interface Window {
        Razorpay: any;
        Shiprocket: any; // Added for Shiprocket Fast Checkout
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useStore();
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('PREPAID');

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const [addrList, userProfile] = await Promise.all([
                    ProfileService.getAddresses(),
                    ProfileService.getProfile()
                ]);
                setAddresses(addrList);
                setProfile(userProfile);

                // Auto-select default address
                const defaultAddr = addrList.find(a => a.is_default);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                else if (addrList.length > 0) setSelectedAddressId(addrList[0].id);
            } catch (error) {
                console.error("Failed to load checkout data:", error);
            }
        };
        loadCheckoutData();
    }, []);

    const handlePayment = async () => {
        if (!selectedAddressId) {
            alert("Please select a shipping address");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order on Backend
            const orderRes = await fetch('/api/checkout/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    total_amount: total,
                    shipping_address_id: selectedAddressId,
                    payment_method: paymentMethod
                })
            });

            if (!orderRes.ok) throw new Error("Failed to create order");
            const orderData = await orderRes.json();

            // 2. Trigger Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ABC Toyz",
                description: "Purchase from ABC Toyz",
                order_id: orderData.razorpay_order_id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await fetch('/api/checkout/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            order_id: orderData.order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    if (verifyRes.ok) {
                        clearCart();
                        router.push(`/checkout/success?oid=${orderData.order_id}`);
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: profile?.full_name || "",
                    contact: profile?.phone || ""
                },
                theme: {
                    color: "#F97316" // Orange primary color
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert(`Failed: ${error.message}`);
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

                        {/* Address Selection */}
                        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <h2 className="font-bold">Shipping Address</h2>
                                </div>
                                <Link href="/profile/addresses" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Add New
                                </Link>
                            </div>

                            <div className="p-4 space-y-3">
                                {addresses.length === 0 ? (
                                    <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed">
                                        <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                        <p className="text-sm text-muted-foreground mb-4">No addresses found</p>
                                        <Link href="/profile/addresses" className="text-sm font-bold text-primary">
                                            Add Your First Address
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedAddressId === addr.id
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-transparent bg-muted/30 hover:bg-muted/50"
                                                    }`}
                                            >
                                                {selectedAddressId === addr.id && (
                                                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm">{addr.name}</span>
                                                    {addr.is_default && (
                                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-1">{addr.phone}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                                    2
                                </div>
                                <h2 className="font-bold">Payment Method</h2>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Prepaid Option */}
                                <div
                                    onClick={() => setPaymentMethod('PREPAID')}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'PREPAID'
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-transparent bg-muted/30 hover:bg-muted/50"
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'PREPAID' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">Full Payment (Prepaid)</p>
                                        <p className="text-xs text-muted-foreground">Pay ₹{total.toLocaleString()} fully and get faster delivery</p>
                                    </div>
                                    {paymentMethod === 'PREPAID' && (
                                        <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>

                                {/* COD Option */}
                                <div
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD'
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-transparent bg-muted/30 hover:bg-muted/50"
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">COD with ₹500 Prepayment</p>
                                        <p className="text-xs text-muted-foreground">Pay ₹500 now, rest on delivery (₹{(total - 500).toLocaleString()})</p>
                                    </div>
                                    {paymentMethod === 'COD' && (
                                        <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            </div>
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
                                onClick={handlePayment}
                                disabled={loading || cart.length === 0}
                                className="w-full bg-primary text-primary-foreground h-14 rounded-full font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {paymentMethod === 'COD' ? 'Pay ₹500 Prepymt' : `Pay ₹${total.toLocaleString()}`}
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-green-600" />
                                100% Secure Checkout with Razorpay
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
