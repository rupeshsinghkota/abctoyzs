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
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useStore();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    // Guest checkout form
    const [guestAddress, setGuestAddress] = useState({
        name: '',
        phone: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: ''
    });

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    useEffect(() => {
        checkAuthAndLoadAddresses();
    }, []);

    async function checkAuthAndLoadAddresses() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setIsLoggedIn(true);
                const data = await ProfileService.getAddresses();
                setAddresses(data);
                const defaultAddr = data.find(a => a.is_default);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                } else if (data.length > 0) {
                    setSelectedAddressId(data[0].id);
                }
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error(error);
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    }

    async function handlePlaceOrder() {
        // Validate address
        const useInlineForm = !isLoggedIn || addresses.length === 0;

        if (!useInlineForm && !selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }

        if (useInlineForm) {
            if (!guestAddress.name || !guestAddress.phone || !guestAddress.address_line1 ||
                !guestAddress.city || !guestAddress.state || !guestAddress.pincode) {
                alert('Please fill in all required address fields');
                return;
            }
            // Email required for guests to create account
            if (!isLoggedIn && !guestAddress.email) {
                alert('Please enter your email address');
                return;
            }
        }

        setPlacing(true);
        try {
            let createdOrder: any = null;
            const supabase = createClient();

            if (isLoggedIn && addresses.length > 0) {
                // Logged-in user with saved address
                createdOrder = await OrderService.createOrder({
                    total_amount: total,
                    shipping_address_id: selectedAddressId!,
                    items: cart.map(item => ({
                        product_id: parseInt(item.id),
                        product_name: item.name,
                        product_image: item.image,
                        quantity: item.quantity,
                        price: item.price
                    }))
                });
            } else {
                // Guest checkout OR logged-in user with no saved addresses
                let userId: string;

                if (!isLoggedIn && guestAddress.email) {
                    // Create account for guest with random password
                    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: guestAddress.email,
                        password: tempPassword,
                        options: {
                            data: {
                                full_name: guestAddress.name,
                                phone: guestAddress.phone
                            }
                        }
                    });

                    if (signUpError) {
                        console.error('Signup error:', signUpError);
                        throw new Error('Could not create account. Email may already exist. Please login or use a different email.');
                    }

                    userId = signUpData.user?.id || '';

                    // Send password reset email so they can set their own password
                    if (guestAddress.email) {
                        await supabase.auth.resetPasswordForEmail(guestAddress.email, {
                            redirectTo: `${window.location.origin}/reset-password`
                        });
                    }
                } else {
                    // Logged-in user with no saved addresses
                    const { data: { user } } = await supabase.auth.getUser();
                    userId = user?.id || '';
                }

                if (!userId) {
                    throw new Error('Could not identify user');
                }

                // Save address for the user
                const { data: newAddress, error: addressError } = await supabase
                    .from('addresses')
                    .insert({
                        user_id: userId,
                        name: guestAddress.name,
                        phone: guestAddress.phone,
                        address_line1: guestAddress.address_line1,
                        address_line2: guestAddress.address_line2 || null,
                        city: guestAddress.city,
                        state: guestAddress.state,
                        pincode: guestAddress.pincode,
                        is_default: true
                    })
                    .select()
                    .single();

                if (addressError) {
                    console.error('Address error:', addressError);
                }

                // Create order
                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        user_id: userId,
                        total_amount: total,
                        shipping_address_id: newAddress?.id || null,
                        status: 'processing'
                    })
                    .select()
                    .single();

                if (orderError) throw orderError;
                createdOrder = order;

                // Create order items
                const itemsToInsert = cart.map(item => ({
                    order_id: order.id,
                    product_id: parseInt(item.id),
                    product_name: item.name,
                    product_image: item.image,
                    quantity: item.quantity,
                    price: item.price
                }));

                await supabase.from('order_items').insert(itemsToInsert);
            }

            if (paymentMethod === 'online' && createdOrder) {
                // Razorpay Options
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXX',
                    amount: Math.round(total * 100), // Amount in paise
                    currency: "INR",
                    name: "ABC Toyz",
                    description: `Order Payment for ${cart.length} items`,
                    image: "/logo.png",
                    handler: async function (response: any) {
                        try {
                            const verifyRes = await fetch('/api/checkout/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    order_id: createdOrder.id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            });

                            if (verifyRes.ok) {
                                clearCart();
                                router.push('/checkout/success');
                            } else {
                                alert("Payment verification failed. Please contact support.");
                            }
                        } catch (err) {
                            console.error("Verification error:", err);
                        }
                    },
                    prefill: {
                        name: isLoggedIn ? "" : guestAddress.name,
                        email: isLoggedIn ? "" : guestAddress.email,
                        contact: isLoggedIn ? "" : guestAddress.phone,
                    },
                    theme: {
                        color: "#f97316",
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    alert("Payment Failed: " + response.error.description);
                    setPlacing(false);
                });
                rzp.open();
            } else {
                // COD Flow
                clearCart();
                router.push('/checkout/success');
            }
        } catch (error: any) {
            alert(error.message || 'Failed to place order. Please try again.');
            setPlacing(false);
        }
    }

    const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGuestAddress((prev: any) => ({ ...prev, [name]: value }));
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

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const guestFormValid = !!(guestAddress.name && guestAddress.phone && guestAddress.address_line1 &&
        guestAddress.city && guestAddress.state && guestAddress.pincode &&
        (!isLoggedIn ? guestAddress.email : true)); // Email required for guests only
    // For logged-in users: either have a selected address OR fill the inline form if no saved addresses
    const isAddressValid = isLoggedIn
        ? (addresses.length > 0 ? !!selectedAddressId : guestFormValid)
        : guestFormValid;

    return (
        <div className="min-h-screen pb-40 lg:pb-12 bg-background">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
                <Link href="/cart" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">Checkout</h1>
                {isLoggedIn === false && (
                    <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                        Guest Checkout
                    </span>
                )}
            </div>

            <div className="p-4 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Login Prompt for Guests */}
                        {isLoggedIn === false && (
                            <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">Have an account?</p>
                                    <p className="text-sm text-muted-foreground">Login to save orders & track shipments</p>
                                </div>
                                <Link href="/login?next=/checkout" className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm">
                                    Login
                                </Link>
                            </div>
                        )}

                        {/* Step 1: Delivery Address */}
                        <div className="bg-card border rounded-2xl overflow-hidden">
                            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <h2 className="font-bold">Delivery Address</h2>
                                </div>
                                {isLoggedIn && (
                                    <Link
                                        href="/profile/addresses/new"
                                        className="text-sm text-primary font-semibold flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add New
                                    </Link>
                                )}
                            </div>

                            <div className="p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : isLoggedIn ? (
                                    // Logged-in: Show saved addresses
                                    addresses.length === 0 ? (
                                        // No saved addresses - show inline form
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                <span>Enter your delivery address below</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input
                                                    name="name"
                                                    placeholder="Full Name *"
                                                    value={guestAddress.name}
                                                    onChange={handleGuestChange}
                                                    className="md:col-span-2 w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                                <input
                                                    name="phone"
                                                    placeholder="Phone *"
                                                    value={guestAddress.phone}
                                                    onChange={handleGuestChange}
                                                    className="md:col-span-2 w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                            </div>
                                            <input
                                                name="address_line1"
                                                placeholder="Address Line 1 *"
                                                value={guestAddress.address_line1}
                                                onChange={handleGuestChange}
                                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                            <input
                                                name="address_line2"
                                                placeholder="Address Line 2 (optional)"
                                                value={guestAddress.address_line2}
                                                onChange={handleGuestChange}
                                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input
                                                    name="city"
                                                    placeholder="City *"
                                                    value={guestAddress.city}
                                                    onChange={handleGuestChange}
                                                    className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                                <input
                                                    name="state"
                                                    placeholder="State *"
                                                    value={guestAddress.state}
                                                    onChange={handleGuestChange}
                                                    className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                                <input
                                                    name="pincode"
                                                    placeholder="Pincode *"
                                                    value={guestAddress.pincode}
                                                    onChange={handleGuestChange}
                                                    className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {addresses.map((address) => (
                                                <button
                                                    key={address.id}
                                                    onClick={() => setSelectedAddressId(address.id)}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAddressId === address.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-muted hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 text-sm lg:text-base">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold">{address.name}</span>
                                                                {address.is_default && (
                                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                                {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                                                                {address.city}, {address.state} - {address.pincode}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-2">📞 {address.phone}</p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAddressId === address.id ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                                            }`}>
                                                            {selectedAddressId === address.id && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    // Guest: Show address form
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                name="name"
                                                placeholder="Full Name *"
                                                value={guestAddress.name}
                                                onChange={handleGuestChange}
                                                className="md:col-span-2 w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                            <input
                                                name="phone"
                                                placeholder="Phone *"
                                                value={guestAddress.phone}
                                                onChange={handleGuestChange}
                                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                            <input
                                                name="email"
                                                placeholder="Email Address *"
                                                value={guestAddress.email}
                                                onChange={handleGuestChange}
                                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <input
                                            name="address_line1"
                                            placeholder="Address Line 1 *"
                                            value={guestAddress.address_line1}
                                            onChange={handleGuestChange}
                                            className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                        <input
                                            name="address_line2"
                                            placeholder="Address Line 2 (optional)"
                                            value={guestAddress.address_line2}
                                            onChange={handleGuestChange}
                                            className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input
                                                name="city"
                                                placeholder="City *"
                                                value={guestAddress.city}
                                                onChange={handleGuestChange}
                                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                            <input
                                                name="state"
                                                placeholder="State *"
                                                value={guestAddress.state}
                                                onChange={handleGuestChange}
                                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                            <input
                                                name="pincode"
                                                placeholder="Pincode *"
                                                value={guestAddress.pincode}
                                                onChange={handleGuestChange}
                                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Payment Method */}
                        <div className="bg-card border rounded-2xl overflow-hidden">
                            <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                                    2
                                </div>
                                <h2 className="font-bold">Payment Method</h2>
                            </div>

                            <div className="p-4 space-y-3">
                                <button
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'cod'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                        <Banknote className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm lg:text-base">Cash on Delivery</p>
                                        <p className="text-xs lg:text-sm text-muted-foreground">Pay when you receive your order</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                        }`}>
                                        {paymentMethod === 'cod' && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('online')}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'online'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm lg:text-base">Online Payment</p>
                                        <p className="text-xs lg:text-sm text-muted-foreground">UPI, Card, NetBanking (via Razorpay)</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'online' ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                        }`}>
                                        {paymentMethod === 'online' && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Order Summary (Visible only on Mobile below forms) */}
                        <div className="lg:hidden">
                            <OrderSummaryCard cart={cart} subtotal={subtotal} total={total} />
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center justify-center gap-8 py-4 text-xs lg:text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                <span>Secure Checkout</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-500" />
                                <span>Free Delivery</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar (Desktop Only) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <OrderSummaryCard cart={cart} subtotal={subtotal} total={total} />

                            {/* Info text */}
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="flex items-center gap-2 text-primary mb-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-sm font-bold">Safe & Secure</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Your data is encrypted and secure. By placing the order, you agree to our <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>.
                                </p>
                            </div>

                            {/* Desktop Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={placing || !isAddressValid}
                                className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all shadow-primary/25"
                            >
                                {placing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        Place Order • ₹{total.toLocaleString()}
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar (Hidden on lg) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-2xl mx-auto">
                    {(isLoggedIn ? (selectedAddress && true) : (guestAddress.name && guestAddress.city)) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 px-1">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="truncate">
                                Delivering to: {isLoggedIn ? selectedAddress?.name : guestAddress.name}, {isLoggedIn ? selectedAddress?.city : guestAddress.city}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={handlePlaceOrder}
                        disabled={placing || !isAddressValid}
                        className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                    >
                        {placing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Placing Order...
                            </>
                        ) : (
                            <>
                                Place Order • ₹{total.toLocaleString()}
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function OrderSummaryCard({ cart, subtotal, total }: { cart: any[], subtotal: number, total: number }) {
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
                        <span className="text-green-600 font-medium">Free</span>
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
