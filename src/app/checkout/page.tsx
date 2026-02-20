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
    Banknote, Loader2, ShieldCheck, Package, ChevronRight,
    Ticket, X
} from 'lucide-react';
import { CheckoutAuth } from '@/components/checkout/CheckoutAuth';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useStore();
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [guestEmail, setGuestEmail] = useState<string>("");
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('PREPAID');
    const [showAddrForm, setShowAddrForm] = useState(false);

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [codSettings, setCodSettings] = useState<any>(null);

    useEffect(() => {
        const fetchCodSettings = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('settings').select('*').single();
            if (data) setCodSettings(data);
        };
        fetchCodSettings();
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const supabase = createClient();
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            setIsCheckingAuth(false);

            // Mark as known user if session exists
            if (currentSession) {
                document.cookie = "known_user=true; path=/; max-age=31536000";
            }
        };
        initAuth();
    }, []);

    const handleAuthenticated = (newSession: any) => {
        setSession(newSession);
        // We can reload or just let the session handle it
        window.location.reload();
    };

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 0;
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const total = subtotal + shipping - discount;

    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const [addrList, userProfile] = await Promise.all([
                    ProfileService.getAddresses(),
                    ProfileService.getProfile()
                ]);
                setAddresses(addrList);
                if (addrList.length === 0) setShowAddrForm(true);

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

    useEffect(() => {
        if (typeof window !== "undefined" && cart.length > 0) {
            // Track InitiateCheckout - Facebook
            if ((window as any).fbq) {
                (window as any).fbq('track', 'InitiateCheckout', {
                    currency: 'INR',
                    value: total,
                    content_ids: cart.map(item => item.id),
                    content_type: 'product',
                    num_items: cart.length
                });
            }
            // Track InitiateCheckout - Google Ads
            if ((window as any).gtag) {
                (window as any).gtag('event', 'begin_checkout', {
                    value: total,
                    currency: 'INR',
                    items: cart.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                });
            }
            console.log('[Tracking] InitiateCheckout event fired');
        }
    }, [total]); // Fire when total is calculated

    // Re-validate coupon when payment method changes
    useEffect(() => {
        if (appliedCoupon && paymentMethod) {
            fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: appliedCoupon.code, amount: subtotal, paymentMethod })
            }).then(res => res.json()).then(data => {
                if (data.error) {
                    setAppliedCoupon(null);
                    setCouponCode('');
                    alert(`Coupon removed: ${data.error}`);
                }
            }).catch(console.error);
        }
    }, [paymentMethod, appliedCoupon?.code, subtotal]);

    const refreshAddresses = async (addrOrId?: any) => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const addrList = await ProfileService.getAddresses();
                setAddresses(addrList);
                // If it was an object, select it
                if (typeof addrOrId === 'object' && addrOrId.id) {
                    setSelectedAddressId(addrOrId.id);
                } else if (typeof addrOrId === 'string') {
                    setSelectedAddressId(addrOrId);
                }
            } else {
                // GUEST: Handle new address
                let newId = typeof addrOrId === 'string' ? addrOrId : addrOrId?.id;

                // If we got an object with email (from addAddress), save it!
                if (typeof addrOrId === 'object' && addrOrId.email) {
                    setGuestEmail(addrOrId.email);
                }

                if (newId) {
                    const { data } = await supabase
                        .from('addresses')
                        .select('*')
                        .eq('id', newId)
                        .single();
                    if (data) setAddresses([data]);
                    setSelectedAddressId(newId);
                }
            }

            setShowAddrForm(false);
        } catch (error) {
            console.error("Failed to refresh addresses:", error);
        }
    };

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
                    discount_amount: discount,
                    coupon_code: appliedCoupon?.code,
                    shipping_address_id: selectedAddressId,
                    payment_method: paymentMethod,
                    // Priority: 1. Profile Email (LoggedIn), 2. Address Email (if saved), 3. Guest Form Email (if just typed)
                    // Since we don't have the form state here easily (it's in subcomponent or cleared), we need to rely on what we have.
                    // For now, let's assume if it's a guest, the address might have the email if we updated the API.
                    // BUT, actually, we should store the email in the address table too if we added it there.
                    // OR, since the form is "ShippingAddressForm", we only save address.
                    // LET'S SIMPLIFY: We need the email in the order.
                    // If user is logged in, use profile.email.
                    // If user is guest, they MUST have just entered an address.
                    // Wait, if they select an existing address (cookie based guest?), they might not have email.
                    // Let's rely on finding the email in the address object (if we update addAddress to save it) OR profile.
                    // Priority: 1. Profile Email (LoggedIn), 2. Guest Email (from state), 3. Address Email (if somehow there), 4. Fallback
                    guest_email: profile?.email || guestEmail || addresses.find(a => a.id === selectedAddressId)?.email || "guest@example.com"
                })
            });

            if (!orderRes.ok) {
                const errorData = await orderRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${orderRes.status}`);
            }
            const orderData = await orderRes.json();

            // 2. Check if Razorpay is needed (Amount > 0)
            if (orderData.razorpay_order_id) {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "ABC Toyz",
                    description: "Purchase from ABC Toyz",
                    order_id: orderData.razorpay_order_id,
                    handler: async function (response: any) {
                        setLoading(true); // Show loading spinner during verification
                        try {
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
                                const result = await verifyRes.json();

                                // Auto-login if new user credentials returned
                                if (result.credentials) {
                                    try {
                                        const supabase = createClient();
                                        await supabase.auth.signInWithPassword({
                                            email: result.credentials.email,
                                            password: result.credentials.password
                                        });
                                    } catch (loginError) {
                                        console.error("Auto-login failed:", loginError);
                                    }
                                }

                                clearCart();
                                const amountInr = orderData.amount / 100;
                                const successUrl = `/checkout/success?oid=${orderData.order_id}&amount=${amountInr}${result.isNewUser ? '&new_account=true' : ''}`;
                                router.push(successUrl);
                            } else {
                                const errorData = await verifyRes.json();
                                console.error("Verification failed:", errorData);
                                alert(`Payment verification failed: ${errorData.error || 'Unknown Error'}`);
                                setLoading(false);
                            }
                        } catch (error) {
                            console.error("Verification Error:", error);
                            alert("An error occurred during payment verification.");
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: addresses.find(a => a.id === selectedAddressId)?.name || profile?.name || "",
                        contact: addresses.find(a => a.id === selectedAddressId)?.phone || profile?.phone || "",
                        email: profile?.email || ""
                    },
                    theme: {
                        color: "#F97316" // Orange primary color
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                // Normal COD - Direct Success
                clearCart();
                router.push(`/checkout/success?oid=${orderData.order_id}&amount=${total}`);
            }

        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert(`Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCoupon = async (eOrCode?: any) => {
        const code = typeof eOrCode === 'string' ? eOrCode : couponCode;
        if (!code.trim()) return;

        if (typeof eOrCode === 'string') {
            setCouponCode(code);
        }

        setIsApplyingCoupon(true);
        setCouponError(null);
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code, amount: subtotal, paymentMethod })
            });
            const data = await res.json();
            if (res.ok) {
                setAppliedCoupon(data);
                setCouponCode('');
            } else {
                setCouponError(data.error || 'Invalid coupon');
                setAppliedCoupon(null);
            }
        } catch (error) {
            setCouponError('Failed to validate coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    if (cart.length === 0 && !loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-xs text-center">Add some awesome toys to your cart to proceed with checkout.</p>
                <Link
                    href="/"
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Securing Session...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen pt-14 md:pt-24 pb-12 bg-gray-50">
                <div className="container mx-auto">
                    <Link
                        href="/cart"
                        className="flex items-center gap-2 text-gray-400 hover:text-primary mb-8 ml-4 transition-colors font-bold text-xs uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Modify Cart
                    </Link>
                    <CheckoutAuth onAuthenticated={handleAuthenticated} cart={cart} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-0">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/cart" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </Link>
                        <h1 className="font-black text-lg md:text-xl tracking-tight text-gray-900">Checkout</h1>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 text-green-700">
                        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest max-sm:hidden">100% Secure Checkout</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest sm:hidden">Secure</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-4 lg:py-6 max-w-[1200px]">
                <div className="grid md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_440px] gap-6 lg:gap-8 xl:gap-12">
                    {/* Left Column: Information */}
                    <div className="space-y-6">

                        {/* Address Selection */}
                        <div className="bg-white border border-gray-100 rounded-3xl lg:rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <div className="p-4 lg:p-7 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-black text-white shadow-sm rounded-full flex items-center justify-center font-black text-sm relative">
                                        1
                                        <div className="absolute inset-0 rounded-full ring-4 ring-black/5" />
                                    </div>
                                    <h2 className="font-black text-base md:text-lg tracking-tight text-gray-900">Shipping Address</h2>
                                </div>
                                {!showAddrForm && (
                                    <button
                                        onClick={() => setShowAddrForm(true)}
                                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add New
                                    </button>
                                )}
                            </div>

                            <div className="p-5 lg:p-7 space-y-4">
                                {showAddrForm ? (
                                    <ShippingAddressForm
                                        onCancel={() => setShowAddrForm(false)}
                                        onSuccess={refreshAddresses}
                                        showCancel={addresses.length > 0}
                                        cart={cart}
                                    />
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed">
                                        <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-sm text-muted-foreground mb-5">No delivery addresses found</p>
                                        <button
                                            onClick={() => setShowAddrForm(true)}
                                            className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg"
                                        >
                                            Add Your First Address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`p-5 lg:p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${selectedAddressId === addr.id
                                                    ? "border-black bg-gray-50/50 shadow-md ring-4 ring-black/5"
                                                    : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30 hover:shadow-sm"
                                                    }`}
                                            >
                                                {selectedAddressId === addr.id && (
                                                    <>
                                                        <div className="absolute top-0 right-0 w-16 h-16 bg-black/5 rounded-bl-[100px] z-0 pointer-events-none" />
                                                        <div className="absolute top-4 right-4 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg z-10 animate-in zoom-in-50 duration-200">
                                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                        </div>
                                                    </>
                                                )}
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-gray-900">{addr.name}</span>
                                                    {addr.is_default && (
                                                        <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] md:text-xs text-muted-foreground mb-1">{addr.phone}</p>
                                                <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2">
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
                        <div className="bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <div className="p-5 lg:p-7 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <div className="w-8 h-8 bg-black text-white shadow-sm rounded-full flex items-center justify-center font-black text-sm relative">
                                    2
                                    <div className="absolute inset-0 rounded-full ring-4 ring-black/5" />
                                </div>
                                <h2 className="font-black text-base md:text-lg tracking-tight text-gray-900">Payment Method</h2>
                            </div>
                            <div className="p-5 lg:p-7 space-y-4">
                                {/* Prepaid Option */}
                                <div
                                    onClick={() => setPaymentMethod('PREPAID')}
                                    className={`flex items-center gap-4 p-5 lg:p-6 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group ${paymentMethod === 'PREPAID'
                                        ? "border-black bg-gray-50/50 shadow-md ring-4 ring-black/5"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30 hover:shadow-sm"
                                        }`}
                                >
                                    {/* Recommended Badge */}
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                        Recommended
                                    </div>

                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${paymentMethod === 'PREPAID' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4 mt-2 sm:mt-0">
                                        <p className="font-black text-gray-900 text-sm md:text-[15px]">Pay Online Now</p>
                                        <p className="text-[11px] text-gray-500 font-medium">Faster dispatch. Secure via Razorpay.</p>
                                    </div>
                                    {paymentMethod === 'PREPAID' && (
                                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-md">
                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* COD Option */}
                                <div
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`flex items-center gap-4 p-5 lg:p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD'
                                        ? "border-black bg-gray-50/50 shadow-md ring-4 ring-black/5"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30 hover:shadow-sm"
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${paymentMethod === 'COD' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-black text-gray-900 text-sm md:text-[15px]">
                                            {codSettings?.cod_mode === 'partial' ? 'Partial COD (Advance)' : 'Cash on Delivery'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 font-medium">
                                            {codSettings?.cod_mode === 'partial'
                                                ? `Pay ₹${calculateCodAdvance(total, codSettings).advance} now to confirm, rest on delivery.`
                                                : 'Pay full amount on delivery.'
                                            }
                                        </p>
                                    </div>
                                    {paymentMethod === 'COD' && (
                                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-md">
                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
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
                            discount={discount}
                            couponCode={couponCode}
                            setCouponCode={setCouponCode}
                            onApplyCoupon={handleApplyCoupon}
                            appliedCoupon={appliedCoupon}
                            setAppliedCoupon={setAppliedCoupon}
                            loading={isApplyingCoupon}
                            error={couponError}
                            paymentMethod={paymentMethod}
                            codSettings={codSettings}
                            onPayment={handlePayment}
                            isPaymentLoading={loading}
                        />

                        {/* Mobile Sticky Checkout Bar */}
                        <div className="lg:hidden fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
                            <button
                                onClick={handlePayment}
                                disabled={loading || cart.length === 0}
                                className="w-full bg-black text-white h-14 md:h-16 rounded-[20px] font-black text-base md:text-lg shadow-xl shadow-black/20 active:scale-[0.98] transition-transform flex items-center justify-between px-6 disabled:opacity-50"
                            >
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total</span>
                                    <span className="text-lg md:text-xl tracking-tight">₹{total.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'COD' ? "Confirm COD" : "Pay Now"}
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </div>
                            </button>
                            <p className="text-[10px] text-center font-bold text-gray-500 mt-3 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                                100% Secure Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ShippingAddressForm({ onCancel, onSuccess, showCancel, cart }: { onCancel: () => void, onSuccess: (addr: any) => void, showCancel: boolean, cart: any[] }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: true
    });

    // Pre-fill phone from verified session
    useEffect(() => {
        const verifiedPhone = localStorage.getItem("verified_phone");
        if (verifiedPhone && !formData.phone) {
            setFormData(prev => ({ ...prev, phone: verifiedPhone }));
        }
    }, []);

    // Real-time Lead Capture
    useEffect(() => {
        const captureLead = async () => {
            // Only capture if phone number looks complete (10 digits)
            const cleanPhone = formData.phone.replace(/\D/g, "");
            if (cleanPhone.length >= 10) {
                try {
                    await fetch('/api/leads', {
                        method: 'POST',
                        body: JSON.stringify({
                            phone: cleanPhone,
                            name: formData.name,
                            email: formData.email,
                            source: 'checkout',
                            cart_summary: cart.map(item => ({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price
                            }))
                        })
                    });
                    localStorage.setItem("isLeadCaptured", "true");
                    document.cookie = "known_user=true; path=/; max-age=31536000"; // 1 Year
                } catch (e) {
                    // Fail silently, don't interrupt user
                    console.warn("Lead capture failed:", e);
                }
            }
        };

        const timer = setTimeout(captureLead, 2000); // 2-second debounce
        return () => clearTimeout(timer);
    }, [formData.phone, formData.name, formData.email, cart]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newAddr = await ProfileService.addAddress(formData);
            // newAddr has the email because we returned it in ProfileService (even if not in DB yet)
            localStorage.setItem("isLeadCaptured", "true");
            document.cookie = "known_user=true; path=/; max-age=31536000";
            onSuccess(newAddr);
        } catch (error) {
            console.error("Failed to add address:", error);
            alert("Failed to save address. Please check all fields.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Rupesh Singh"
                        className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Phone Number</label>
                    <input
                        required
                        type="tel"
                        placeholder="e.g. 9876543210"
                        className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address (for order updates)</label>
                <input
                    required
                    type="email"
                    placeholder="e.g. rupesh@example.com"
                    className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Address Line 1</label>
                <input
                    required
                    type="text"
                    placeholder="House No, Building, Street"
                    className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Address Line 2 (Optional)</label>
                <input
                    type="text"
                    placeholder="Landmark, Area, Colony"
                    className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">City</label>
                    <input
                        required
                        type="text"
                        placeholder="City"
                        className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Pincode</label>
                    <input
                        required
                        type="text"
                        placeholder="6-digit ZIP"
                        className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">State</label>
                <select
                    required
                    className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                >
                    <option value="">Select State</option>
                    {[
                        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
                        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
                        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
                        "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
                        "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
                        "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep",
                        "Puducherry", "Ladakh", "Jammu and Kashmir"
                    ].sort().map(state => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3 pt-2">
                {showCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 border rounded-xl font-bold text-sm hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save & Continue"}
                </button>
            </div>
        </form>
    );
}

function OrderSummaryCard({
    cart,
    subtotal,
    total,
    shipping,
    discount = 0,
    couponCode,
    setCouponCode,
    onApplyCoupon,
    appliedCoupon,
    setAppliedCoupon,
    loading,
    error,
    paymentMethod,
    codSettings,
    onPayment,
    isPaymentLoading
}: {
    cart: any[];
    subtotal: number;
    total: number;
    shipping: number;
    discount?: number;
    couponCode: string;
    setCouponCode: (v: string) => void;
    onApplyCoupon: (overrideCode?: string) => Promise<void>;
    appliedCoupon: any;
    setAppliedCoupon: (v: any) => void;
    loading: boolean;
    error: string | null;
    paymentMethod: 'PREPAID' | 'COD';
    codSettings?: any;
    onPayment: () => void;
    isPaymentLoading: boolean;
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl lg:rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:sticky md:top-20 lg:top-24">
            <div className="p-4 lg:p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black text-white shadow-sm rounded-full flex items-center justify-center font-black text-sm relative">
                        3
                        <div className="absolute inset-0 rounded-full ring-4 ring-black/5" />
                    </div>
                    <h2 className="font-black text-base md:text-lg tracking-tight text-gray-900">Order Summary</h2>
                </div>
            </div>

            <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                {/* Product List */}
                <div className="max-h-[25vh] overflow-y-auto pr-2 no-scrollbar border-b border-gray-100 pb-3 lg:pb-4">
                    {cart.map((item: any) => (
                        <div key={item.id} className="flex gap-4 mb-5 last:mb-0 items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 mb-0 shadow-sm">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs md:text-sm text-gray-900 line-clamp-2 leading-tight">{item.name}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                                    <div className="flex items-center gap-1.5">
                                        {(item.regularPrice || item.mrp) && (item.regularPrice || item.mrp)! > item.price && (
                                            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase line-through">₹{(item.regularPrice || item.mrp)?.toLocaleString()}</span>
                                        )}
                                        <span className="text-[10px] text-black font-black tracking-widest uppercase">@ ₹{item.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                                <p className="font-black text-gray-900 text-sm md:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                                {(item.regularPrice || item.mrp) && (item.regularPrice || item.mrp)! > item.price && (
                                    <p className="text-green-600 text-[9px] font-black uppercase tracking-widest mt-0.5 whitespace-nowrap">
                                        Save ₹{(((item.regularPrice || item.mrp)!) - item.price).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Available Offers (Auto Apply) */}
                {!appliedCoupon && (
                    <div className="pt-2 pb-1">
                        <div className="bg-orange-50/80 border border-orange-200/50 rounded-2xl p-4 flex items-center justify-between gap-3 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/10 to-transparent rounded-bl-[100px] pointer-events-none" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0 border border-orange-100/50">
                                    <Ticket className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-black text-gray-900 tracking-tight">PREPAID5</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Save 5% on Online Payment</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onApplyCoupon('PREPAID5')}
                                disabled={loading}
                                className="bg-white text-orange-600 border border-orange-200 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-50 relative z-10"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {/* Coupon Input */}
                <div className="pt-2">
                    {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-green-600" />
                                <div>
                                    <p className="text-[10px] font-bold text-green-700 uppercase leading-none">Coupon Applied</p>
                                    <p className="font-bold text-sm text-green-900">{appliedCoupon.code}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAppliedCoupon(null)}
                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-green-600" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Coupon code"
                                    className="flex-1 p-3 rounded-xl border bg-background text-sm font-bold uppercase focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                // onKeyDown disabled to avoid form submit issues, use button
                                />
                                <button
                                    onClick={() => onApplyCoupon()}
                                    disabled={loading || !couponCode.trim()}
                                    className="px-4 py-3 bg-zinc-900 text-white font-bold rounded-xl text-xs hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                </button>
                            </div>
                            {error && (
                                <p className="text-[10px] text-red-500 font-bold ml-1 animate-in slide-in-from-top-1">
                                    {error}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-3 text-xs md:text-sm pt-2">
                    <div className="flex justify-between items-center text-gray-500 font-medium">
                        <span>Subtotal ({cart.length} items)</span>
                        <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 font-medium">
                        <span>Shipping</span>
                        <span className={shipping === 0 ? "text-green-600 font-black tracking-widest uppercase text-xs" : "text-gray-900 font-bold"}>
                            {shipping === 0 ? "Free" : `₹${shipping}`}
                        </span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between items-center text-green-600 font-black bg-green-50 p-2.5 rounded-xl border border-green-100 animate-in fade-in duration-300 mt-2">
                            <span className="flex items-center gap-1.5"><Ticket className="w-4 h-4" /> Coupon Savings</span>
                            <span>- ₹{discount.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="h-px w-full bg-gray-100 my-4" />

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="font-black text-xl md:text-2xl tracking-tighter text-gray-900 leading-none">Total</span>
                            <span className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Incl. of all taxes</span>
                        </div>
                        <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">₹{total.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            {/* Payment Button (Desktop Only) */}
            <div className="hidden lg:block p-8 pt-0 border-t border-gray-100 mt-6 bg-gray-50/30">
                <button
                    onClick={onPayment}
                    disabled={isPaymentLoading || cart.length === 0}
                    className="w-full mt-8 bg-black text-white h-[72px] rounded-[24px] font-black text-xl shadow-xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isPaymentLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {paymentMethod === 'COD' ? (
                                codSettings?.cod_mode === 'partial'
                                    ? `Pay ₹${calculateCodAdvance(total, codSettings).advance.toLocaleString()} Advance`
                                    : "Complete Cash on Delivery"
                            ) : (
                                `Pay ₹${total.toLocaleString()} Securely`
                            )}
                            <ChevronRight className="w-6 h-6" />
                        </>
                    )}
                </button>
                <p className="text-xs text-center font-bold text-gray-400 mt-4 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    100% Secure Checkout • Encrypted
                </p>
                <p className="text-[10px] text-center text-gray-400 mt-2 px-4 leading-relaxed">
                    By placing your order, you agree to ABC Toyz Terms of Service and Privacy Policy. All transactions are securely processed.
                </p>
            </div>
        </div>
    );
}

// Helper to calculate advance
function calculateCodAdvance(total: number, settings: any) {
    if (!settings || settings.cod_mode !== 'partial') return { advance: 0, balance: total };

    let advance = 0;
    if (settings.cod_advance_type === 'percentage') {
        advance = Math.round((total * settings.cod_advance_value) / 100);
    } else {
        advance = settings.cod_advance_value;
    }

    // Safety: Advance cannot exceed total
    if (advance > total) advance = total;

    return { advance, balance: total - advance };
}
