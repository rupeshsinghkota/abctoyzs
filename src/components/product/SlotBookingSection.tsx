"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles, User, Mail, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ProfileService } from '@/lib/services/profile';

interface SlotBookingSectionProps {
    productId: string;
    productName: string;
    productPrice: number;
}

export function SlotBookingSection({ productId, productName, productPrice }: SlotBookingSectionProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [formStep, setFormStep] = useState<1 | 2>(1);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'success'>('idle');
    const [isBooking, setIsBooking] = useState(false);
    const [meetLink, setMeetLink] = useState<string | null>(null);
    const [supabaseOrderId, setSupabaseOrderId] = useState<string | null>(null);

    // Auto-fill logged in user details
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await ProfileService.getProfile();
                if (profile) {
                    if (profile.full_name) setCustomerName(profile.full_name);
                    if (profile.email) setCustomerEmail(profile.email);
                    if (profile.phone) setCustomerPhone(profile.phone);
                }
            } catch (err) {
                console.error("Error fetching profile for booking:", err);
            }
        };
        fetchProfile();
    }, []);

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

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(customerPhone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setIsBooking(true);

        try {
            const orderRes = await fetch('/api/bookings/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    productName,
                    customerName,
                    customerEmail,
                    customerPhone,
                    productPrice
                })
            });

            if (!orderRes.ok) throw new Error('Failed to initialize booking');
            const orderData = await orderRes.json();
            setSupabaseOrderId(orderData.supabaseOrderId);

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: "INR",
                name: "ABC Toyz",
                description: `Live Video Call: ${productName}`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        toast.info("Verifying booking details...");

                        const bookingRes = await fetch('/api/bookings/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                productId,
                                productName,
                                date: selectedDate,
                                time: selectedTime,
                                customerName,
                                customerEmail,
                                customerPhone,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature
                            })
                        });

                        const bookingData = await bookingRes.json();

                        if (bookingRes.ok || bookingData.simulated) {
                            setMeetLink(bookingData.meetLink || null);
                            setBookingStatus('success');
                            toast.success("Slot Reserved! See you on the call.");

                            setTimeout(() => {
                                window.location.href = `/checkout/success?booking=true&oid=${orderData.supabaseOrderId}&amount=99`;
                            }, 3000);
                        } else {
                            throw new Error(bookingData.message || 'Failed to generate meeting link');
                        }
                    } catch (error: any) {
                        toast.error(error.message || "Failed to finalize booking");
                    }
                },
                prefill: {
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone
                },
                theme: {
                    color: "#F97316"
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
        <section id="slot-booking" className="mt-12 mb-20 bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

            <div className="md:grid md:grid-cols-12 h-full relative z-10">

                {/* Left: Value Proposition */}
                <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center space-y-10 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-900/40 backdrop-blur-md text-white">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Experience Excellence</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black leading-tight">
                            Personal <span className="text-primary italic">Live</span> <br />Showcase.
                        </h2>
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
                            Get an exclusive 1-on-1 virtual walkthrough of <span className="text-white font-bold">{productName}</span>.
                            Our experts will demonstrate every feature, light, and sound just for you.
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {[
                            { icon: Video, title: 'HD Interactive Demo', desc: 'See the exact product from every angle and ask questions in real-time.' },
                            { icon: Sparkles, title: 'Personalized Expert Guidance', desc: 'Expert tips on how to get the most out of your ride-on toy.' },
                            { icon: ShieldCheck, title: 'Trusted Reservation', desc: 'Secure your preference before it goes out of stock.' }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-4 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors shrink-0">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white text-sm font-black">{feature.title}</h4>
                                    <p className="text-zinc-500 text-xs leading-normal">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-8 mt-auto hidden md:block">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <div className="w-8 h-px bg-zinc-800" /> Authorized Showroom Partner
                        </div>
                    </div>
                </div>

                {/* Right: Booking Form */}
                <div className="md:col-span-7 p-6 md:p-12 flex flex-col justify-center min-h-[600px] relative overflow-hidden bg-zinc-900/10">
                    <div className="absolute top-0 right-0 -mr-32 -mt-32 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <AnimatePresence mode="wait">
                        {bookingStatus === 'idle' ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-10 max-w-lg mx-auto w-full bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative"
                            >
                                {formStep === 1 ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-white/90 flex items-center gap-2 uppercase tracking-widest">
                                                <Calendar className="w-4 h-4 text-primary" /> Choose a Date
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {dates.map((d, i) => (
                                                    <motion.button
                                                        key={d.full}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        onClick={() => setSelectedDate(d.full)}
                                                        className={cn(
                                                            "group flex flex-col items-center p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                                                            selectedDate === d.full
                                                                ? "border-primary bg-primary text-white shadow-[0_0_30px_-10px_rgba(249,115,22,0.5)]"
                                                                : "border-white/5 text-zinc-400 bg-white/5 hover:border-white/20"
                                                        )}
                                                    >
                                                        <span className={cn("text-[9px] font-black uppercase tracking-tighter mb-1", selectedDate === d.full ? "text-white/80" : "text-zinc-500")}>{d.day}</span>
                                                        <span className="text-3xl font-black">{d.date}</span>
                                                        <span className={cn("text-[9px] font-black uppercase tracking-tighter mt-1", selectedDate === d.full ? "text-white/80" : "text-zinc-500")}>{d.month}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-white/90 flex items-center gap-2 uppercase tracking-widest">
                                                <Clock className="w-4 h-4 text-primary" /> Available Slots
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {timeSlots.map((t, i) => (
                                                    <motion.button
                                                        key={t}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.15 + (i * 0.05) }}
                                                        onClick={() => setSelectedTime(t)}
                                                        className={cn(
                                                            "px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                            selectedTime === t
                                                                ? "bg-white text-zinc-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                                                : "bg-white/5 text-zinc-300 border-white/10 hover:border-white/25"
                                                        )}
                                                    >
                                                        {t}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            disabled={!selectedDate || !selectedTime}
                                            onClick={() => setFormStep(2)}
                                            className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                                        >
                                            Next Step <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-white/90 flex items-center gap-2 uppercase tracking-widest">
                                                Identify Yourself
                                            </label>
                                            <div className="space-y-3">
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="text"
                                                        placeholder="Your Name"
                                                        value={customerName}
                                                        onChange={(e) => setCustomerName(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/50 outline-none text-white text-sm font-bold transition-all"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="email"
                                                        placeholder="Email Address"
                                                        value={customerEmail}
                                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/50 outline-none text-white text-sm font-bold transition-all"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="tel"
                                                        placeholder="WhatsApp Number"
                                                        value={customerPhone}
                                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/50 outline-none text-white text-sm font-bold transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                                                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-zinc-300 font-black uppercase leading-tight">100% Adjustable Deposit</p>
                                                    <p className="text-[9px] text-zinc-500 font-bold mt-1">A small ₹99 deposit is required to prevent spam. This is fully credited back to you on your order.</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setFormStep(1)}
                                                    className="px-6 py-4 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-colors text-xs font-black uppercase"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={handleBooking}
                                                    disabled={!customerName || !customerEmail || customerPhone.length < 10 || isBooking}
                                                    className="flex-1 py-5 bg-white text-zinc-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-zinc-100 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                                                >
                                                    {isBooking ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>Reserve Experience <ArrowRight className="w-4 h-4" /></>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-10 py-10 max-w-lg mx-auto"
                            >
                                <div className="relative">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 12 }}
                                        className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-8 border-white/5 shadow-[0_0_50px_rgba(249,115,22,0.5)]"
                                    >
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </motion.div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-4xl font-black text-white tracking-tight">Access Granted!</h3>
                                    <p className="text-zinc-400 text-sm max-w-[300px] mx-auto leading-relaxed">
                                        Your private demo of {productName} is locked in. Check your email for the magic link.
                                    </p>
                                </div>

                                <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-white/5 to-transparent w-full">
                                    <div className="bg-zinc-900/80 rounded-[2.4rem] p-8 text-left space-y-6 backdrop-blur-xl border border-white/5">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Scheduled For</p>
                                                <p className="text-lg font-black text-white">{new Date(selectedDate!).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live At</p>
                                                <p className="text-lg font-black text-white">{selectedTime}</p>
                                            </div>
                                        </div>
                                        {meetLink && (
                                            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10">
                                                <Video className="w-5 h-5" /> Launch Google Meet
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
}
