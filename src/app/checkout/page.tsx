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
    Banknote, Loader2, ShieldCheck, Package, ChevronRight
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
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('PREPAID');
    const [showAddrForm, setShowAddrForm] = useState(false);

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

    const refreshAddresses = async (newId?: string) => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const addrList = await ProfileService.getAddresses();
                setAddresses(addrList);
            } else if (newId) {
                // For guest, we fetch just the ONE address we created
                const { data } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('id', newId)
                    .single();
                if (data) setAddresses([data]);
            }

            if (newId) setSelectedAddressId(newId);
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
                    guest_email: addresses.find(a => a.id === selectedAddressId)?.email || profile?.email || "guest@example.com"
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
                                    // Don't block success page if login fails
                                }
                            }

                            clearCart();
                            router.push(`/checkout/success?oid=${orderData.order_id}`);
                        } else {
                            const errorData = await verifyRes.json();
                            console.error("Verification failed:", errorData);
                            alert("Payment verification failed. Please contact support.");
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
                                    />
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed">
                                        <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                        <p className="text-sm text-muted-foreground mb-4">No addresses found</p>
                                        <button
                                            onClick={() => setShowAddrForm(true)}
                                            className="text-sm font-bold text-primary"
                                        >
                                            Add Your First Address
                                        </button>
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

function ShippingAddressForm({ onCancel, onSuccess, showCancel }: { onCancel: () => void, onSuccess: (id?: string) => void, showCancel: boolean }) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newAddr = await ProfileService.addAddress(formData);
            onSuccess(newAddr.id);
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
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
