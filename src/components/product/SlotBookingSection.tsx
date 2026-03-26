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
    isDrawer?: boolean;
}

export function SlotBookingSection({ productId, productName, productPrice, isDrawer = false }: SlotBookingSectionProps) {
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
        const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
        if (!phoneRegex.test(cleanPhone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        // Check if Razorpay is loaded
        if (!(window as any).Razorpay) {
            toast.error("Payment system is still loading. Please wait 2 seconds.");
            return;
        }

        setIsBooking(true);

        try {
            console.log('[Booking] Initializing payment for:', productName);
            const orderRes = await fetch('/api/bookings/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    productName,
                    customerName,
                    customerEmail,
                    customerPhone: cleanPhone,
                    productPrice
                })
            });

            if (!orderRes.ok) {
                const errorData = await orderRes.json();
                throw new Error(errorData.message || 'Failed to initialize booking');
            }

            const orderData = await orderRes.json();
            setSupabaseOrderId(orderData.supabaseOrderId);

            if (orderData.amount === 0 || !orderData.orderId) {
                            // Free Booking: Call creation directly
                            console.log('[Booking] Free booking detected, creating meeting immediately...');
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
                                    customerPhone: cleanPhone,
                                    supabaseOrderId: orderData.supabaseOrderId // Pass this for identifying the order in backend
                                })
                            });

                            const bookingData = await bookingRes.json();

                            if (bookingRes.ok || bookingData.simulated) {
                                setMeetLink(bookingData.meetLink || null);
                                setBookingStatus('success');
                                toast.success("Slot Reserved! See you on the call.");

                                setTimeout(() => {
                                    window.location.href = `/checkout/success?booking=true&oid=${orderData.supabaseOrderId}&amount=0`;
                                }, 3000);
                            } else {
                                throw new Error(bookingData.message || 'Failed to generate meeting link');
                            }
                            return;
                        }

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
                                            customerPhone: cleanPhone,
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
                                            window.location.href = `/checkout/success?booking=true&oid=${orderData.supabaseOrderId}&amount=0`;
                                        }, 3000);
                                    } else {
                                        throw new Error(bookingData.message || 'Failed to generate meeting link');
                                    }
                                } catch (error: any) {
                                    console.error('[Booking Finalize Error]:', error);
                                    toast.error(error.message || "Failed to finalize booking");
                                    setIsBooking(false); // Must reset since success state wasn't reached
                                }
                            },
                prefill: {
                    name: customerName,
                    email: customerEmail,
                    contact: cleanPhone
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
        <section
            id="slot-booking"
            className={cn(
                isDrawer ? "mt-4" : "mt-12 mb-20 bg-zinc-950 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden",
                "relative"
            )}
        >
            {!isDrawer && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />}

            <div className={cn(isDrawer ? "block" : "md:grid md:grid-cols-12", "h-full relative z-10")}>

                {/* Left: Value Proposition */}
                {!isDrawer && (
                    <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center space-y-12 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-900/40 backdrop-blur-md text-white overflow-hidden relative">
                        {/* Background Decor */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                            <div className="absolute top-10 left-10 w-32 h-32 bg-primary blur-[80px] rounded-full animate-pulse" />
                            <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 blur-[100px] rounded-full animate-pulse [animation-delay:2s]" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6 relative z-10"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full shadow-inner">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/90">Showroom Live</span>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter">
                                    Experience <span className="text-primary italic">Detail.</span>
                                </h2>
                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">1-on-1 Virtual Gallery Tour</p>
                            </div>

                            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
                                Step into our premium showroom from your phone. Our product specialists will give you a detailed walkthrough of <span className="text-white font-bold">{productName}</span> with high-definition clarity.
                            </p>
                        </motion.div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-6">
                                {[
                                    { icon: Video, title: 'HD Cinematic Feed', desc: 'See every curve, chrome finish, and LED detail in stunning high definition.' },
                                    { icon: Sparkles, title: 'Expert Consultation', desc: 'Our specialists will guide you on features, battery life, and assembly live.' },
                                    { icon: ShieldCheck, title: 'Completely Free Experience', desc: 'Book your private showroom tour for free. No credit card required.' }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all duration-500 shrink-0 shadow-lg group-hover:shadow-primary/10">
                                            <feature.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-white text-sm font-black group-hover:text-primary transition-colors">{feature.title}</h4>
                                            <p className="text-zinc-500 text-xs leading-normal font-medium">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Showroom Specialists */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="pt-6 border-t border-white/5 space-y-4"
                            >
                                <p className="text-[10px] filter grayscale opacity-50 font-black uppercase tracking-widest">Today's Specialists</p>
                                <div className="flex items-center gap-6">
                                    {[
                                        { name: 'Rahul S.', role: 'Senior Tech' },
                                        { name: 'Arjun K.', role: 'Ride-on Expert' }
                                    ].map((expert, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-black">
                                                {expert.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black">{expert.name}</p>
                                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">{expert.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-8 mt-auto hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                    <div className="w-8 h-px bg-zinc-800" /> Showroom Verified
                                </div>
                                <div className="px-2 py-0.5 rounded border border-zinc-700 text-[8px] font-black text-zinc-400">BIS IN-5529</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Right: Booking Form */}
                <div className={cn(
                    "flex flex-col justify-center relative overflow-hidden",
                    isDrawer ? "col-span-12 p-4" : "md:col-span-7 p-6 md:p-12 min-h-[600px] bg-zinc-900/10"
                )}>
                    {!isDrawer && (
                        <>
                            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                        </>
                    )}

                    <AnimatePresence mode="wait">
                        {bookingStatus === 'idle' ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className={cn(
                                    "max-w-lg mx-auto w-full relative",
                                    isDrawer ? "space-y-6" : "space-y-10 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl"
                                )}
                            >
                                {/* Progress Indicator */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={cn("h-1 flex-1 rounded-full transition-all duration-500", formStep === 1 ? "bg-primary" : "bg-primary/20")} />
                                    <div className={cn("h-1 flex-1 rounded-full transition-all duration-500", formStep === 2 ? "bg-primary" : "bg-white/10")} />
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">Step {formStep}/2</span>
                                </div>

                                {formStep === 1 ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-10"
                                    >
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[11px] font-black text-zinc-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                    <Calendar className="w-3.5 h-3.5 text-primary" /> Select Date
                                                </label>
                                                <span className="text-[9px] font-bold text-orange-500/80 animate-pulse bg-orange-500/10 px-2 py-0.5 rounded-full">Selling Fast 🔥</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                {dates.map((d, i) => (
                                                    <motion.button
                                                        key={d.full}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        onClick={() => setSelectedDate(d.full)}
                                                        className={cn(
                                                            "group flex flex-col items-center p-5 rounded-3xl border-2 transition-all relative overflow-hidden",
                                                            selectedDate === d.full
                                                                ? "border-primary bg-primary text-white shadow-[0_20px_40px_-15px_rgba(249,115,22,0.4)]"
                                                                : "border-white/5 text-zinc-400 bg-white/5 hover:border-white/20 active:scale-95"
                                                        )}
                                                    >
                                                        <span className={cn("text-[9px] font-black uppercase tracking-tighter mb-1", selectedDate === d.full ? "text-white/80" : "text-zinc-500")}>{d.day}</span>
                                                        <span className="text-3xl font-black">{d.date}</span>
                                                        <span className={cn("text-[10px] font-black uppercase tracking-tighter mt-1", selectedDate === d.full ? "text-white/80" : "text-zinc-500")}>{d.month}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <label className="text-[11px] font-black text-zinc-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                <Clock className="w-3.5 h-3.5 text-primary" /> Preferred Time
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {timeSlots.map((t, i) => (
                                                    <motion.button
                                                        key={t}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.15 + (i * 0.05) }}
                                                        onClick={() => setSelectedTime(t)}
                                                        className={cn(
                                                            "px-6 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                            selectedTime === t
                                                                ? "bg-white text-zinc-900 border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                                                                : "bg-white/5 text-zinc-300 border-white/10 hover:border-white/25 active:scale-95"
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
                                            className="w-full py-6 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 group"
                                        >
                                            Next Step <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-10"
                                    >
                                        <div className="space-y-6">
                                            <label className="text-[11px] font-black text-zinc-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                                                Contact Information
                                            </label>
                                            <div className="space-y-4">
                                                <div className="relative group">
                                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={customerName}
                                                        onChange={(e) => setCustomerName(e.target.value)}
                                                        className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white/5 border border-white/5 focus:border-primary/50 focus:bg-white/10 outline-none text-white text-sm font-bold transition-all placeholder:text-zinc-600 shadow-inner"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="email"
                                                        placeholder="Email Address"
                                                        value={customerEmail}
                                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                                        className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white/5 border border-white/5 focus:border-primary/50 focus:bg-white/10 outline-none text-white text-sm font-bold transition-all placeholder:text-zinc-600 shadow-inner"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="tel"
                                                        placeholder="WhatsApp Number"
                                                        value={customerPhone}
                                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                        className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white/5 border border-white/5 focus:border-primary/50 focus:bg-white/10 outline-none text-white text-sm font-bold transition-all placeholder:text-zinc-600 shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <ShieldCheck className="w-6 h-6 text-primary shrink-0 relative z-10" />
                                                <div className="flex-1 relative z-10">
                                                    <p className="text-[11px] text-white font-black uppercase tracking-wider">Free Video Consultation</p>
                                                    <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-relaxed">Experience our premium ride-on toys live. No booking fee or hidden charges. Our experts are ready to show you the details.</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setFormStep(1)}
                                                    className="px-8 py-5 rounded-3xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest active:scale-95"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={handleBooking}
                                                    disabled={!customerName || !customerEmail || customerPhone.length < 10 || isBooking}
                                                    className="flex-1 py-6 bg-white text-zinc-900 font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:bg-zinc-100 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 active:scale-[0.98]"
                                                >
                                                    {isBooking ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
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
                                className={cn(
                                    "flex flex-col items-center justify-center text-center mx-auto w-full",
                                    isDrawer ? "space-y-8 py-6" : "space-y-12 py-10 max-w-lg"
                                )}
                            >
                                <div className="relative">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 15 }}
                                        className={cn(
                                            "rounded-full bg-primary flex items-center justify-center border-white/5",
                                            isDrawer ? "w-24 h-24 border-8" : "w-32 h-32 border-[12px] shadow-[0_0_80px_rgba(249,115,22,0.6)]"
                                        )}
                                    >
                                        <CheckCircle2 className={cn("text-white", isDrawer ? "w-10 h-10" : "w-14 h-14")} />
                                    </motion.div>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-white shadow-2xl flex items-center justify-center text-[10px] font-black text-primary border-4 border-zinc-950"
                                    >
                                        VIP
                                    </motion.div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className={cn("font-black text-white tracking-tighter", isDrawer ? "text-3xl" : "text-5xl")}>Spot Secured!</h3>
                                    <p className="text-zinc-500 text-[11px] max-w-[280px] mx-auto leading-relaxed font-bold uppercase tracking-widest">
                                        Private consultation confirmed.
                                    </p>
                                </div>

                                <div className={cn(
                                    "p-[1px] rounded-[2rem] bg-gradient-to-br from-primary/50 via-white/10 to-transparent w-full shadow-2xl",
                                    isDrawer ? "max-w-xs" : ""
                                )}>
                                    <div className={cn(
                                        "bg-zinc-950/50 rounded-[1.9rem] text-left backdrop-blur-3xl relative overflow-hidden",
                                        isDrawer ? "p-6 space-y-4" : "p-10 space-y-8"
                                    )}>
                                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Scheduled Date</p>
                                                <p className="text-sm font-black text-white">{new Date(selectedDate!).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Live At</p>
                                                <p className="text-sm font-black text-white">{selectedTime}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Status</p>
                                                <p className="text-[10px] font-black text-primary uppercase italic">Ready</p>
                                            </div>
                                        </div>

                                        {meetLink && (
                                            <motion.a
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                href={meetLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-3 w-full py-4 bg-white text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                            >
                                                <Video className="w-4 h-4" /> Enter Showroom
                                            </motion.a>
                                        )}
                                    </div>
                                </div>

                                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">Check your WhatsApp</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
}
