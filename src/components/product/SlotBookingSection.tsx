"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Video, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SlotBookingSectionProps {
    productId: string;
    productName: string;
}

export function SlotBookingSection({ productId, productName }: SlotBookingSectionProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [step, setStep] = useState<1 | 2>(1);
    const [isBooking, setIsBooking] = useState(false);
    const [meetLink, setMeetLink] = useState<string | null>(null);

    // Generate dates (next 3 working days)
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

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error("Please select a date and time");
            return;
        }

        if (!customerName || !customerEmail || !customerPhone) {
            toast.error("Please fill in your contact details");
            return;
        }

        // Basic phone validation (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(customerPhone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setIsBooking(true);

        try {
            // 1. Create Razorpay Order
            const orderRes = await fetch('/api/bookings/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, productName })
            });

            if (!orderRes.ok) throw new Error('Failed to initialize payment');
            const orderData = await orderRes.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: "INR",
                name: "ABC Toyz",
                description: `Live Video Call: ${productName}`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        toast.info("Payment verified. Generating meeting link...");

                        // 3. Call our API to verify payment and create the Google Meet link
                        const bookingRes = await fetch('/api/bookings/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                productId,
                                productName,
                                date: selectedDate,
                                time: selectedTime,
                                // Pass the actual user state form details
                                customerName: customerName,
                                customerEmail: customerEmail,
                                customerPhone: customerPhone,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature
                            })
                        });

                        const bookingData = await bookingRes.json();

                        // Handle success or simulated success
                        if (bookingRes.ok || bookingData.simulated) {
                            setMeetLink(bookingData.meetLink || null);
                            toast.success(`Slot reserved! ${bookingData.simulated ? '(Simulated/Missing GCP Setup)' : ''}`);
                            setStep(2);
                        } else {
                            throw new Error(bookingData.message || 'Failed to generate meeting link');
                        }

                    } catch (error: any) {
                        toast.error(error.message || "Failed to finalize booking");
                    } finally {
                        setIsBooking(false);
                    }
                },
                prefill: {
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone
                },
                theme: {
                    color: "#000000"
                },
                modal: {
                    ondismiss: function () {
                        setIsBooking(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error(`Payment failed: ${response.error.description}`);
                setIsBooking(false);
            });
            rzp.open();

        } catch (error: any) {
            console.error('Booking error:', error);
            toast.error(error.message || "Something went wrong.");
            setIsBooking(false);
        }
    };

    return (
        <section id="slot-booking" className="mt-8 mb-16 bg-white rounded-[2rem] overflow-hidden border border-zinc-200 shadow-sm relative">
            <div className="md:grid md:grid-cols-12 h-full">

                {/* Left: Value Proposition */}
                <div className="md:col-span-5 p-6 md:p-10 flex flex-col justify-center space-y-8 bg-zinc-50 border-b md:border-b-0 md:border-r border-zinc-200">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Live Video Consultation</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">
                            See {productName} <span className="text-primary italic">Live</span>.
                        </h2>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                            Book a 10-minute HD video call with our showroom experts. See the product's quality, features, and size before making your decision.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-zinc-100">
                                <Video className="w-5 h-5 text-zinc-900" />
                            </div>
                            <div>
                                <h4 className="text-zinc-900 text-sm font-black">Interactive 1-on-1 Demo</h4>
                                <p className="text-zinc-500 text-xs mt-1">We'll show you the exact model, turn on the lights, and answer any questions live on camera.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="text-zinc-900 text-sm font-black">₹99 Adjustable Fee</h4>
                                <p className="text-zinc-500 text-xs mt-1">Pay a small fee to prevent spam. This is 100% adjusted against your final purchase.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Booking Form */}
                <div className="md:col-span-7 bg-white p-6 md:p-10 flex flex-col justify-center min-h-[500px]">
                    {step === 1 ? (
                        <div className="space-y-8 max-w-md mx-auto w-full">
                            <div className="space-y-4">
                                <label className="text-sm font-black text-zinc-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" /> Select an available Date
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {dates.map((d) => (
                                        <button
                                            key={d.full}
                                            onClick={() => setSelectedDate(d.full)}
                                            className={cn(
                                                "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                                                selectedDate === d.full
                                                    ? "border-primary bg-primary/5 shadow-sm transform scale-100"
                                                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300 transform hover:scale-[1.02]"
                                            )}
                                        >
                                            <span className={cn("text-[10px] uppercase font-bold", selectedDate === d.full ? "text-primary" : "text-zinc-400")}>{d.day}</span>
                                            <span className={cn("text-xl font-black my-1", selectedDate === d.full ? "text-zinc-900" : "text-zinc-700")}>{d.date}</span>
                                            <span className={cn("text-[10px] uppercase font-bold", selectedDate === d.full ? "text-primary" : "text-zinc-400")}>{d.month}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-zinc-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" /> Select an available Time Slot
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {timeSlots.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTime(t)}
                                            className={cn(
                                                "px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all",
                                                selectedTime === t
                                                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <label className="text-sm font-black text-zinc-900 flex items-center gap-2">
                                    Your Details
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                            required
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone (10 digits)"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-100">
                                <button
                                    onClick={handleBooking}
                                    disabled={!selectedDate || !selectedTime || !customerName || !customerEmail || customerPhone.length < 10 || isBooking}
                                    className="w-full py-4 bg-zinc-900 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2"
                                >
                                    {isBooking ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                    ) : (
                                        <>Pay ₹99 & Book Slot <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-zinc-400 font-medium mt-3">
                                    Secure payment via Razorpay. We'll automatically email you a Google Meet link.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500 py-10 max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border-4 border-white shadow-lg">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Slot Reserved!</h3>
                                <p className="text-zinc-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                                    Your 1-on-1 video call is confirmed. We've sent the calendar invite to your email.
                                </p>
                            </div>
                            <div className="bg-zinc-50 rounded-xl p-5 w-full border border-zinc-200 text-left space-y-3">
                                <div className="flex items-center gap-3 text-zinc-900 font-medium text-sm">
                                    <Calendar className="w-4 h-4 text-zinc-400" />
                                    <span>{new Date(selectedDate!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-900 font-medium text-sm">
                                    <Clock className="w-4 h-4 text-zinc-400" />
                                    <span>{selectedTime} IST</span>
                                </div>
                                {meetLink && (
                                    <div className="pt-3 mt-3 border-t border-zinc-200">
                                        <a href={meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-black uppercase transition-colors">
                                            <Video className="w-4 h-4" /> Join Google Meet
                                        </a>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => window.location.href = '#slot-booking'} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 underline underline-offset-4">
                                Done
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
