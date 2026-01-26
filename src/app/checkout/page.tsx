"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ProfileService, Address } from '@/lib/services/profile';
import { OrderService } from '@/lib/services/orders';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, MapPin, Plus, Check, Truck, CreditCard,
    Banknote, Loader2, ShieldCheck, Package, ChevronRight
} from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useStore();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    useEffect(() => {
        loadAddresses();
    }, []);

    async function loadAddresses() {
        try {
            const data = await ProfileService.getAddresses();
            setAddresses(data);
            // Auto-select default address
            const defaultAddr = data.find(a => a.is_default);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            } else if (data.length > 0) {
                setSelectedAddressId(data[0].id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handlePlaceOrder() {
        if (!selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }

        setPlacing(true);
        try {
            // Create order via OrderService
            await OrderService.createOrder({
                total_amount: total,
                shipping_address_id: selectedAddressId,
                items: cart.map(item => ({
                    product_id: parseInt(item.id),
                    product_name: item.name,
                    product_image: item.image,
                    quantity: item.quantity,
                    price: item.price
                }))
            });

            clearCart();
            router.push('/checkout/success');
        } catch (error) {
            alert('Failed to place order. Please try again.');
            setPlacing(false);
        }
    }

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

    return (
        <div className="min-h-screen pb-32 bg-background">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
                <Link href="/cart" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">Checkout</h1>
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-6">

                {/* Step 1: Delivery Address */}
                <div className="bg-card border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                                1
                            </div>
                            <h2 className="font-bold">Delivery Address</h2>
                        </div>
                        <Link
                            href="/profile/addresses/new"
                            className="text-sm text-primary font-semibold flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </Link>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center py-8">
                                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No saved addresses</p>
                                <Link
                                    href="/profile/addresses/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Address
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
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
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold">{address.name}</span>
                                                    {address.is_default && (
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                                                    {address.city}, {address.state} - {address.pincode}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">📞 {address.phone}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAddressId === address.id ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                                }`}>
                                                {selectedAddressId === address.id && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                        </div>
                                    </button>
                                ))}
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
                                <p className="font-bold">Cash on Delivery</p>
                                <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                }`}>
                                {paymentMethod === 'cod' && <Check className="w-4 h-4 text-white" />}
                            </div>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('online')}
                            disabled
                            className="w-full text-left p-4 rounded-xl border-2 border-muted opacity-50 flex items-center gap-4 cursor-not-allowed"
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">Online Payment</p>
                                <p className="text-sm text-muted-foreground">Coming soon - UPI, Card, NetBanking</p>
                            </div>
                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-card border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                            3
                        </div>
                        <h2 className="font-bold">Order Summary</h2>
                    </div>

                    <div className="p-4 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    <p className="font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}

                        <div className="border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total</span>
                                <span className="text-primary">₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 py-4 text-sm text-muted-foreground">
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

            {/* Fixed Bottom Place Order */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-30">
                <div className="max-w-2xl mx-auto">
                    {selectedAddress && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">Delivering to: {selectedAddress.name}, {selectedAddress.city}</span>
                        </div>
                    )}
                    <button
                        onClick={handlePlaceOrder}
                        disabled={placing || !selectedAddressId}
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
