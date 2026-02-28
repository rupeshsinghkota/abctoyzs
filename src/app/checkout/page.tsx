"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ProfileService, Address } from '@/lib/services/profile';
import { OrderService } from '@/lib/services/orders';
import { createClient } from '@/lib/supabase/client';
import { BISCertificateModal } from '@/components/product/BISCertificateModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, MapPin, Plus, Check, Truck, CreditCard,
    Banknote, Loader2, ShieldCheck, Package, ChevronRight,
    Ticket, X, CheckCircle2
} from 'lucide-react';
import { CheckoutAuth } from '@/components/checkout/CheckoutAuth';
import { mapToGA4Item, trackEvent } from '@/components/tracking/GoogleTracking';

declare global {
    interface Window {
        Razorpay: any;
    }
}

import { BRAND_CONFIG } from '@/config/brand';


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
    const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD' | 'BOOKING'>('PREPAID');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [isBISModalOpen, setIsBISModalOpen] = useState(false);
    const [deliveryEstimate, setDeliveryEstimate] = useState<{
        formattedDate?: string;
        loading: boolean;
        serviceable: boolean;
        message?: string;
    }>({ loading: false, serviceable: false });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [codSettings, setCodSettings] = useState<any>(null);

    // Generate dates (next 3 working days) for Booking
    const getNextDays = (days: number) => {
        let count = 0;
        let d = new Date();
        const dates = [];
        while (count < days) {
            d.setDate(d.getDate() + 1);
            if (d.getDay() !== 0) { // Skip Sundays
                dates.push({
                    full: d.toISOString().split('T')[0],
                    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    date: d.getDate(),
                    month: d.toLocaleDateString('en-US', { month: 'short' })
                });
                count++;
            }
        }
        return dates;
    };
    const dates = getNextDays(3);
    const timeSlots = ["11:00 AM", "12:30 PM", "02:00 PM", "04:30 PM", "06:00 PM"];

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
                setProfile(userProfile);
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
            // Track begin_checkout - GA4
            trackEvent('begin_checkout', {
                value: total,
                currency: 'INR',
                items: cart.map(mapToGA4Item)
            });
            console.log('[Tracking] Checkout events fired');
        }
    }, [total]); // Fire when total is calculated


    // Delivery Estimate Effect
    useEffect(() => {
        const fetchDeliveryEstimate = async () => {
            if (!selectedAddressId || !addresses.length) return;

            const selectedAddress = addresses.find(a => a.id === selectedAddressId);
            if (!selectedAddress?.pincode) return;

            setDeliveryEstimate(prev => ({ ...prev, loading: true }));
            try {
                // Calculate aggregate weight and dimensions
                // For simplified logic, we'll use the first item's dims or defaults, and sum weights
                let totalWeight = 0;
                let maxL = 100, maxB = 60, maxH = 50;

                cart.forEach(item => {
                    const parseDim = (str?: string) => {
                        if (!str) return null;
                        const matches = str.match(/(\d+(\.\d+)?)/g);
                        return matches ? matches.map(Number) : null;
                    };

                    const dims = parseDim(item.box_dimensions || item.product_dimensions);
                    const w = parseDim(item.gross_weight || item.net_weight);

                    totalWeight += (w ? w[0] : 10) * item.quantity;
                    if (dims) {
                        maxL = Math.max(maxL, dims[0]);
                        maxB = Math.max(maxB, dims[1] || 60);
                        maxH = Math.max(maxH, dims[2] || 50);
                    }
                });

                const queryParams = new URLSearchParams({
                    pincode: selectedAddress.pincode,
                    weight: totalWeight.toString(),
                    length: maxL.toString(),
                    breadth: maxB.toString(),
                    height: maxH.toString()
                });

                const res = await fetch(`/api/shipping/estimate?${queryParams.toString()}`);
                const data = await res.json();

                if (data.serviceable) {
                    setDeliveryEstimate({
                        serviceable: true,
                        formattedDate: data.formattedDate,
                        loading: false
                    });
                } else {
                    setDeliveryEstimate({
                        serviceable: false,
                        message: data.message || 'Location not serviceable',
                        loading: false
                    });
                }
            } catch (error) {
                console.error("Delivery estimate error:", error);
                setDeliveryEstimate({
                    serviceable: false,
                    loading: false,
                    message: "Failed to load estimate"
                });
            }
        };

        fetchDeliveryEstimate();
    }, [selectedAddressId, addresses, cart]);

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
                    // Silently remove - don't announce to avoid negative customer friction
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
            // Priority: 1. Profile Email (LoggedIn), 2. Guest Email (from state), 3. Address Email (if somehow there), 4. Fallback
            const checkoutEmail = profile?.email || guestEmail || addresses.find(a => a.id === selectedAddressId)?.email || "guest@example.com";
            const checkoutName = addresses.find(a => a.id === selectedAddressId)?.name || profile?.name || "";
            const checkoutPhone = addresses.find(a => a.id === selectedAddressId)?.phone || profile?.phone || "";

            // --- BOOKING FLOW ---
            if (paymentMethod === 'BOOKING') {
                if (!selectedDate || !selectedTime) {
                    alert("Please select a date and time for your booking.");
                    setLoading(false);
                    return;
                }

                // Create a consolidated product name from the cart items
                const combinedProductNames = cart.map(item => item.name).join(', ');

                // 1. Create a Standard Pending Order + Razorpay Order for ₹99 Booking Fee
                const orderRes = await fetch('/api/checkout/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        total_amount: total,
                        discount_amount: appliedCoupon ? (total * appliedCoupon.discount / 100) : 0,
                        coupon_code: appliedCoupon?.code || null,
                        shipping_address_id: selectedAddressId,
                        payment_method: 'BOOKING',
                        guest_email: checkoutEmail
                    }),
                });

                if (!orderRes.ok) throw new Error('Failed to initialize booking order');
                const orderData = await orderRes.json();

                // 2. Open Razorpay Checkout for booking
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: orderData.amount, // Will be 9900 (₹99 in paise)
                    currency: orderData.currency,
                    name: "ABC Toyz",
                    description: `Live Video Tour Booking`,
                    order_id: orderData.razorpay_order_id,
                    handler: async function (response: any) {
                        try {
                            setLoading(true); // Re-flag loading during meeting link gen

                            // 3. Call booking API to verify payment and create Google Meet link
                            const bookingRes = await fetch('/api/bookings/create', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    productId: "cart_booking",
                                    productName: combinedProductNames,
                                    date: selectedDate,
                                    time: selectedTime,
                                    customerName: checkoutName,
                                    customerEmail: checkoutEmail,
                                    customerPhone: checkoutPhone,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpaySignature: response.razorpay_signature
                                })
                            });

                            const bookingData = await bookingRes.json();

                            if (bookingRes.ok || bookingData.simulated) {
                                clearCart();
                                // Send to success page with booking flag
                                router.push(`/checkout/success?booking=true`);
                            } else {
                                throw new Error(bookingData.message || 'Failed to generate meeting link');
                            }
                        } catch (error: any) {
                            console.error("Booking verification failed:", error);
                            alert(`Booking finalization failed: ${error.message || 'Unknown Error'}`);
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: checkoutName,
                        email: checkoutEmail,
                        contact: checkoutPhone
                    },
                    theme: { color: "#000000" },
                    modal: {
                        ondismiss: function () {
                            setLoading(false);
                        }
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    alert(`Payment failed: ${response.error.description}`);
                    setLoading(false);
                });
                rzp.open();

                return; // Stop standard checkout flow here
            }

            // --- STANDARD CHECKOUT FLOW ---
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
                    guest_email: checkoutEmail
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
                                // We pass the TOTAL amount for tracking, even if only advance was paid
                                const totalVal = orderData.total_amount;
                                const successUrl = `/checkout/success?oid=${orderData.order_id}&amount=${totalVal}${result.isNewUser ? '&new_account=true' : ''}`;
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
                        name: checkoutName,
                        contact: checkoutPhone,
                        email: checkoutEmail
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

    // Auto-apply PREPAID5 when switching to PREPAID with no coupon already applied
    useEffect(() => {
        if (paymentMethod === 'PREPAID' && !appliedCoupon && subtotal > 0) {
            handleApplyCoupon('PREPAID5');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentMethod]);

    // One-click switch to prepaid + auto apply coupon
    const handleSwitchToPrepaid = () => {
        setPaymentMethod('PREPAID');
        // useEffect above will auto-apply PREPAID5
    };

    if (!mounted) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading Secure Checkout...</p>
            </div>
        );
    }

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

            <main className="container mx-auto px-4 py-2 max-w-[1200px]">
                <div className="grid md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_440px] gap-3 lg:gap-4">
                    {/* Left Column: Information */}
                    <div className="space-y-4">

                        {/* Address Selection */}
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-black text-white shadow-sm rounded-full flex items-center justify-center font-black text-[10px]">
                                        1
                                    </div>
                                    <h2 className="font-black text-sm md:text-base tracking-tight text-gray-900">Shipping Address</h2>
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

                            <div className="p-4 space-y-3">
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
                                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden group ${selectedAddressId === addr.id
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
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <div className="w-5 h-5 bg-black text-white shadow-sm rounded-full flex items-center justify-center font-black text-[10px]">
                                    2
                                </div>
                                <h2 className="font-black text-sm md:text-base tracking-tight text-gray-900">Payment Method</h2>
                            </div>
                            <div className="p-3 space-y-2">
                                {/* Prepaid Option */}
                                <div
                                    onClick={() => setPaymentMethod('PREPAID')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group ${paymentMethod === 'PREPAID'
                                        ? "border-zinc-900 bg-zinc-50/50 shadow-md ring-4 ring-zinc-900/5"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-zinc-50/30 hover:shadow-sm"
                                        }`}
                                >
                                    {/* Recommended Badge */}
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                        Recommended
                                    </div>

                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${paymentMethod === 'PREPAID' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <CreditCard className="w-4 h-4" />
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
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD'
                                        ? "border-zinc-900 bg-zinc-50/50 shadow-md ring-4 ring-zinc-900/5"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-zinc-50/30 hover:shadow-sm"
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${paymentMethod === 'COD' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Banknote className="w-4 h-4" />
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

                                {/* BOOKING Option */}
                                <div
                                    onClick={() => setPaymentMethod('BOOKING')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group ${paymentMethod === 'BOOKING'
                                        ? "border-zinc-900 bg-zinc-50/50 shadow-md ring-4 ring-zinc-900/5"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-zinc-50/30 hover:shadow-sm"
                                        }`}
                                >
                                    {paymentMethod !== 'BOOKING' && (
                                        <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                            Refundable
                                        </div>
                                    )}

                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${paymentMethod === 'BOOKING' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4 mt-2 sm:mt-0">
                                        <p className="font-black text-gray-900 text-sm md:text-[15px]">Book Live Video Call</p>
                                        <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Pay ₹99 for a 1-on-1 video call to see it live.</p>
                                    </div>
                                    {paymentMethod === 'BOOKING' && (
                                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-md">
                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Booking Dynamic Slot Selection Module */}
                                {paymentMethod === 'BOOKING' && (
                                    <div className="mx-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-400 pt-2">
                                        <div className="rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-sm overflow-hidden relative group">
                                            <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                                                Select Your Slot
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                                    {dates.map((d) => (
                                                        <button
                                                            key={d.full}
                                                            onClick={() => setSelectedDate(d.full)}
                                                            className={`shrink-0 flex flex-col items-center justify-center w-20 py-3 rounded-xl border-2 transition-all snap-start ${selectedDate === d.full
                                                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-md scale-[1.02]'
                                                                : 'border-zinc-100 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:border-zinc-300'
                                                                }`}
                                                        >
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${selectedDate === d.full ? 'text-zinc-300' : 'text-zinc-400'}`}>{d.day}</span>
                                                            <span className={`text-2xl font-black leading-none mb-1 ${selectedDate === d.full ? 'text-white' : 'text-zinc-900'}`}>{d.date}</span>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedDate === d.full ? 'text-zinc-300' : 'text-zinc-400'}`}>{d.month}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="pt-2 border-t border-zinc-100">
                                                    <div className="flex flex-wrap gap-2">
                                                        {timeSlots.map((time) => (
                                                            <button
                                                                key={time}
                                                                disabled={!selectedDate}
                                                                onClick={() => setSelectedTime(time)}
                                                                className={`px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all ${selectedTime === time
                                                                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                                                                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                {time}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 mt-4 text-[10px] font-medium text-zinc-500 leading-relaxed">
                                                    <strong>Note:</strong> You will be charged ₹99 today for the tour slot. This fee prevents spam and <span className="text-zinc-900 font-black">will be fully adjusted</span> against your final order value if you decide to purchase.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* COD Dynamic Trust Module — Shown for both COD modes */}
                                {paymentMethod === 'COD' && (
                                    <div className="mx-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-400">
                                        {/* Security & Verification Box (Indigo) */}
                                        <div className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 p-5 shadow-sm overflow-hidden relative group">
                                            {/* Decorative Security Seal Background */}
                                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                                <ShieldCheck className="w-32 h-32 text-indigo-900" />
                                            </div>

                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className="mt-0.5 p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 ring-4 ring-white">
                                                    <ShieldCheck className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <p className="text-xs font-black text-indigo-950 uppercase tracking-tight">Verified Secure Booking</p>
                                                        <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm">
                                                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                                            <span className="text-[8px] font-black text-indigo-600 uppercase">100% Refund Guarantee</span>
                                                        </div>
                                                    </div>

                                                    {codSettings?.cod_mode === 'partial' ? (
                                                        <p className="text-[11px] text-indigo-800 font-medium leading-relaxed">
                                                            Pay a secure <span className="text-indigo-950 font-black">₹{calculateCodAdvance(total, codSettings).advance.toLocaleString()} booking advance</span> via Razorpay to confirm your slot and activate **Genuine Order VIP Service**.
                                                        </p>
                                                    ) : (
                                                        <p className="text-[11px] text-indigo-800 font-medium leading-relaxed">
                                                            Your order will be <span className="text-indigo-950 font-black italic">Manually Verified</span> by our team before dispatch to ensure 100% accuracy and safety.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Trust Points Integrated */}
                                            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-indigo-100/60 relative z-10">
                                                <div className="flex flex-col items-center text-center gap-1.5 grayscale-[0.3] hover:grayscale-0 transition-all cursor-default">
                                                    <div className="p-2 bg-white rounded-xl border border-indigo-50 shadow-sm">
                                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <span className="text-[9px] font-black text-indigo-950 leading-none">GST Verified</span>
                                                </div>
                                                <div className="flex flex-col items-center text-center gap-1.5 grayscale-[0.3] hover:grayscale-0 transition-all cursor-default" onClick={() => setIsBISModalOpen(true)}>
                                                    <div className="p-2 bg-white rounded-xl border border-indigo-50 shadow-sm">
                                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="text-[9px] font-black text-indigo-950 leading-none">ISI Mark</span>
                                                </div>
                                                <div className="flex flex-col items-center text-center gap-1.5 grayscale-[0.3] hover:grayscale-0 transition-all cursor-default">
                                                    <div className="p-2 bg-white rounded-xl border border-indigo-50 shadow-sm">
                                                        <Package className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-[9px] font-black text-indigo-950 leading-none">Stock Verified</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-indigo-100/40 flex justify-center">
                                                <Link href="/payment-policy" target="_blank" className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 underline decoration-indigo-200 underline-offset-4">
                                                    Why Advanced Payment? Learn More →
                                                </Link>
                                            </div>

                                            {/* Advanced Payment Split (Only for Partial) */}
                                            {codSettings?.cod_mode === 'partial' && (
                                                <div className="mt-5 grid grid-cols-2 gap-3 relative z-10">
                                                    <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm flex flex-col items-center justify-center">
                                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Confirm Now</span>
                                                        <span className="text-sm font-black text-indigo-950">₹{calculateCodAdvance(total, codSettings).advance.toLocaleString()}</span>
                                                    </div>
                                                    <div className="bg-indigo-600/5 p-3 rounded-2xl border border-indigo-100/50 flex flex-col items-center justify-center">
                                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pay on Delivery</span>
                                                        <span className="text-sm font-black text-indigo-950">₹{calculateCodAdvance(total, codSettings).balance.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Razorpay Protection Line */}
                                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-indigo-400 font-bold tracking-tight bg-indigo-50/50 py-1.5 rounded-lg border border-indigo-100/30">
                                                <CreditCard className="w-3 h-3" />
                                                Payment Secured by Razorpay & PCI-DSS
                                            </div>

                                        </div>

                                        {/* Step-by-Step Verification Journey */}
                                        <div className="rounded-2xl bg-zinc-900 p-4 relative overflow-hidden">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Priority Processing</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex gap-3">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-black text-primary">1</div>
                                                        <div className="w-0.5 h-full bg-zinc-800" />
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="text-[11px] font-black text-white">Confirmation Call/WhatsApp</p>
                                                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Our agent will contact you within 1-2 hours to verify your details.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-500">2</div>
                                                        <div className="w-0.5 h-full bg-zinc-800" />
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="text-[11px] font-black text-zinc-400">Quality Check & Dispatch</p>
                                                        <p className="text-[10px] text-zinc-600 font-medium">Order is inspected and packed with ISI safety mark.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-500">3</div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-zinc-400">Tracked Delivery</p>
                                                        <p className="text-[10px] text-zinc-600 font-medium">Live tracking shared via WhatsApp & Email.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Final Incentive to Switch */}
                                        {codSettings?.cod_mode === 'partial' && (
                                            <button
                                                onClick={handleSwitchToPrepaid}
                                                className="w-full relative overflow-hidden group rounded-2xl p-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                            >
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div className="text-left">
                                                        <p className="text-xs font-black uppercase tracking-tight">Avoid the Wait ⚡</p>
                                                        <p className="text-[10px] text-white/90 font-bold">Skip verification & Save Extra ₹{Math.round(total * 0.05).toLocaleString()}</p>
                                                    </div>
                                                    <div className="bg-white text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                                                        PAY FULL NOW →
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                )}
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
                            selectedAddressId={selectedAddressId}
                            deliveryEstimate={deliveryEstimate}
                        />

                        {/* Mobile Sticky Checkout Bar */}
                        <div className="lg:hidden fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
                            <button
                                onClick={handlePayment}
                                disabled={loading || cart.length === 0 || !selectedAddressId}
                                className="w-full bg-black text-white h-14 md:h-16 rounded-[20px] font-black text-base md:text-lg shadow-xl shadow-black/20 active:scale-[0.98] transition-transform flex items-center justify-between px-6 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            {!selectedAddressId ? "Select Address First" : paymentMethod === 'BOOKING' ? "Pay ₹99 & Book" : paymentMethod === 'COD' ? (
                                                codSettings?.cod_mode === 'partial'
                                                    ? `Pay ₹${calculateCodAdvance(total, codSettings).advance.toLocaleString()} Advance`
                                                    : "Confirm COD"
                                            ) : "Pay Now"}
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

            {/* BIS Modal Integration */}
            <BISCertificateModal
                isOpen={isBISModalOpen}
                onClose={() => setIsBISModalOpen(false)}
            />
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
        <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-3">
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

            <div className="flex gap-2 pt-1">
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
    isPaymentLoading,
    selectedAddressId,
    deliveryEstimate
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
    paymentMethod: 'PREPAID' | 'COD' | 'BOOKING';
    codSettings?: any;
    onPayment: () => void;
    isPaymentLoading: boolean;
    selectedAddressId: string | null;
    deliveryEstimate?: {
        formattedDate?: string;
        loading: boolean;
        serviceable: boolean;
        message?: string;
    };
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl lg:rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:sticky md:top-20 lg:top-24">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-black text-white shadow-sm rounded-full flex items-center justify-center font-black text-[10px]">
                        3
                    </div>
                    <h2 className="font-black text-sm md:text-base tracking-tight text-gray-900">Order Summary</h2>
                </div>
            </div>

            <div className="p-3 space-y-3 lg:space-y-4">
                {/* Product List */}
                <div className="max-h-[25vh] overflow-y-auto pr-2 no-scrollbar border-b border-gray-100 pb-2 lg:pb-3">
                    {cart.map((item: any) => (
                        <div key={item.id} className="flex gap-3 mb-2 last:mb-0 items-center">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded-md">Qty: {item.quantity}</span>
                                    <div className="flex items-center gap-1.5">
                                        {(item.regularPrice || item.mrp) && (item.regularPrice || item.mrp)! > item.price && (
                                            <span className="text-[10px] text-gray-400 font-bold line-through">₹{(item.regularPrice || item.mrp)?.toLocaleString()}</span>
                                        )}
                                        <span className="text-[10px] text-black font-black">₹{item.price.toLocaleString()}</span>
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

                {/* Smart Coupon Section */}
                <div>
                    {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-green-600" />
                                <div>
                                    <p className="text-[10px] font-bold text-green-700 uppercase leading-none">Coupon Applied</p>
                                    <p className="font-bold text-sm text-green-900">{appliedCoupon.code} — Save ₹{discount.toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setAppliedCoupon(null)} className="p-1 hover:bg-green-100 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-green-600" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Quick Apply Offer */}
                            <div className="flex items-center gap-2 bg-orange-50/80 border border-orange-200/50 rounded-xl px-3 py-2">
                                <Ticket className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-black text-gray-900">PREPAID5</span>
                                    <span className="text-[10px] text-gray-400 font-medium ml-1.5">• Save 5% on Online Payment</span>
                                </div>
                                <button
                                    onClick={() => onApplyCoupon('PREPAID5')}
                                    disabled={loading}
                                    className="text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-300 bg-white px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-all shrink-0 disabled:opacity-50"
                                >
                                    Apply
                                </button>
                            </div>
                            {/* Manual Coupon Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Have another coupon?"
                                    className="flex-1 p-2.5 rounded-xl border bg-background text-xs font-bold uppercase focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <button
                                    onClick={() => onApplyCoupon()}
                                    disabled={loading || !couponCode.trim()}
                                    className="px-3 py-2 bg-zinc-900 text-white font-bold rounded-xl text-xs hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                </button>
                            </div>
                            {error && (
                                <p className="text-[10px] text-red-500 font-bold ml-1 animate-in slide-in-from-top-1">{error}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2 text-xs md:text-sm pt-1">
                    <div className="flex justify-between items-center text-gray-500 font-medium">
                        <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                        <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 font-medium">
                        <span>Shipping</span>
                        <div className="text-right">
                            <span className={shipping === 0 ? "text-green-600 font-black tracking-widest uppercase text-xs" : "text-gray-900 font-bold"}>
                                {shipping === 0 ? "Free" : `₹${shipping}`}
                            </span>
                            {deliveryEstimate?.formattedDate && (
                                <p className="text-[10px] text-zinc-500 font-bold mt-0.5 animate-in fade-in slide-in-from-right-1">
                                    Delivery by <span className="text-black">{deliveryEstimate.formattedDate}</span>
                                </p>
                            )}
                            {deliveryEstimate?.loading && (
                                <p className="text-[9px] text-zinc-400 font-bold animate-pulse mt-0.5">Calculating delivery...</p>
                            )}
                        </div>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between items-center text-green-600 font-black bg-green-50 p-2 rounded-xl border border-green-100 animate-in fade-in duration-300">
                            <span className="flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Coupon Savings</span>
                            <span>- ₹{discount.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="h-px w-full bg-gray-100 my-2" />

                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-black text-xl lg:text-2xl tracking-tight text-gray-900">Total</span>
                            <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">Incl. of all taxes</p>
                        </div>
                        <span className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tighter">₹{total.toLocaleString()}</span>
                    </div>

                    {/* Total Savings Summary */}
                    {(() => {
                        const totalSaved = cart.reduce((acc: number, item: any) => {
                            const mrp = item.regularPrice || item.mrp;
                            if (mrp && mrp > item.price) return acc + (mrp - item.price) * item.quantity;
                            return acc;
                        }, 0) + discount;
                        return totalSaved > 0 ? (
                            <div className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-100 rounded-xl py-1.5 animate-in fade-in">
                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">🎉 You're saving ₹{totalSaved.toLocaleString()} on this order!</span>
                            </div>
                        ) : null;
                    })()}
                </div>
            </div>
            {/* Payment Button (Desktop Only) */}
            <div className="hidden lg:block p-4 pt-0 border-t border-gray-100 mt-4 bg-gray-50/30">
                <button
                    onClick={onPayment}
                    disabled={isPaymentLoading || cart.length === 0 || !selectedAddressId}
                    className="group relative w-full mt-4 bg-zinc-900 text-white h-14 md:h-[60px] rounded-2xl font-black text-lg shadow-xl shadow-zinc-900/20 hover:shadow-zinc-900/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                >
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                        <div className="relative h-full w-8 bg-white/20" />
                    </div>
                    {isPaymentLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {!selectedAddressId ? "Select Address First" : paymentMethod === 'BOOKING' ? "Pay ₹99 & Book Video Call" : paymentMethod === 'COD' ? (
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

                {/* Trust Highlights Sidebar */}
                <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-50 shadow-sm group">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Verified Experience</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900">Official GST Invoice</p>
                                    <p className="text-[10px] text-gray-500">100% Tax Compliant Indian Entity</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <div className="text-[10px] font-black text-blue-600 italic">ISI</div>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900">BIS Safety Marks</p>
                                    <p className="text-[10px] text-gray-500">Child-safe materials & build</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Truck className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900">Quality Checked</p>
                                    <p className="text-[10px] text-gray-500">Rigorous inspection before packing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-[10px] text-center text-gray-400 mt-4 px-4 leading-relaxed">
                    By placing your order, you agree to ABC Toyz Terms of Service and Privacy Policy. All transactions are securely processed.
                </p>
            </div>
        </div>
    );
}

// Helper to calculate advance
function calculateCodAdvance(total: number, settings: any) {
    if (!settings || settings.cod_mode !== 'partial') {
        // Fallback to BRAND_CONFIG if settings are not loaded yet or missing
        if (BRAND_CONFIG.payment.codAdvanceType === 'percentage') {
            const advance = Math.round((total * BRAND_CONFIG.payment.codAdvanceAmount) / 100);
            return { advance: Math.min(advance, total), balance: total - Math.min(advance, total) };
        } else {
            const advance = BRAND_CONFIG.payment.codAdvanceAmount;
            return { advance: Math.min(advance, total), balance: total - Math.min(advance, total) };
        }
    }

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
