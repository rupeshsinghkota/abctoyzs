"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowRight, ShieldCheck, CheckCircle2, MessageCircle, Lock, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface CheckoutAuthProps {
    onAuthenticated: (session: any) => void;
    cart: any[];
}

export function CheckoutAuth({ onAuthenticated, cart }: CheckoutAuthProps) {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let interval: any;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    useEffect(() => {
        // Auto-fill from lead capture or previous session
        const savedPhone = localStorage.getItem("lead_phone") || localStorage.getItem("captured_phone");
        if (savedPhone && savedPhone.length >= 10) {
            // Clean and take last 10
            const clean = savedPhone.replace(/\D/g, '').slice(-10);
            setPhone(clean);
        }
    }, []);

    const handleSendOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (phone.length < 10) return toast.error("Please enter a valid 10-digit number");

        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    cart_summary: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity
                    }))
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            toast.success("Verification code sent!");
            setStep('OTP');
            setResendTimer(30); // 30 second cooldown
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 6) return toast.error("Please enter 6-digit OTP");

        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Verification failed");

            if (data.session) {
                const supabase = createClient();
                const { error: sessionError } = await supabase.auth.setSession(data.session);
                if (sessionError) throw sessionError;

                toast.success("Verified successfully!");

                // Mark as lead captured and known user
                localStorage.setItem("isLeadCaptured", "true");
                localStorage.setItem("verified_phone", phone);
                document.cookie = "known_user=true; path=/; max-age=31536000";

                onAuthenticated(data.session);

                // --- Captured Lead after successful verification ---
                try {
                    fetch('/api/leads', {
                        method: 'POST',
                        body: JSON.stringify({
                            phone: phone,
                            source: 'checkout_otp_verified',
                            cart_summary: cart.map(item => ({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                image: item.image
                            }))
                        })
                    });
                } catch (e) {
                    console.warn("Lead capture after OTP failed:", e);
                }
            } else if (data.session_link) {
                // Existing user: follow magic link to get real session
                toast.success("Welcome back! Continuing to checkout...");
                localStorage.setItem("isLeadCaptured", "true");
                localStorage.setItem("verified_phone", phone);
                document.cookie = "known_user=true; path=/; max-age=31536000";

                // Redirect to the callback URL which handles session setting
                window.location.href = data.session_link;
            } else {
                throw new Error("Verification response invalid");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`checkout-otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`checkout-otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[400px] md:min-h-[500px]">

                {/* Visual Sidebar - Hidden on Mobile */}
                <div className="hidden md:flex w-full md:w-2/5 bg-zinc-900 p-8 md:p-10 flex-col justify-between relative text-white">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <ShieldCheck className="w-64 h-64" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 leading-tight tracking-tight">
                            Safe & Fast <br />Shop.
                        </h2>
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[200px]">
                            Join 10k+ parents shopping securely on ABC Toyz.
                        </p>
                    </div>

                    <div className="space-y-6 relative z-10 pt-12">
                        {[
                            { icon: MessageCircle, label: "Get Updates on WhatsApp" },
                            { icon: CheckCircle2, label: "One-Click Order Tracking" },
                            { icon: ShieldCheck, label: "Encrypted Secure Payments" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm font-bold opacity-80 group hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <item.icon className="w-4 h-4 text-primary" />
                                </div>
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-6 md:p-14 flex flex-col justify-center">
                    <div className="mb-8 md:mb-10 text-center md:text-left">
                        {/* Cart Teaser */}
                        {cart.length > 0 && (
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                                {cart.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm relative">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {cart.length > 3 && (
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm">
                                        +{cart.length - 3}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            Step 1: Verification
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight mb-2">
                            {step === 'PHONE' ? 'Almost yours!' : 'Check WhatsApp'}
                        </h3>
                        <p className="text-zinc-500 font-medium text-sm">
                            {step === 'PHONE'
                                ? 'Verify your number to secure your order.'
                                : `We've sent a 6-digit code to +91 ${phone}`
                            }
                        </p>
                    </div>

                    {step === 'PHONE' ? (
                        <form onSubmit={handleSendOTP} className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-3">
                                <div className="flex bg-zinc-50/50 border-2 border-zinc-100 rounded-2xl md:rounded-[1.5rem] p-1.5 focus-within:ring-4 focus-within:ring-[#25D366]/10 focus-within:border-[#25D366]/30 transition-all shadow-sm">
                                    <div className="flex items-center gap-2 px-4 py-3 md:py-4 bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-100">
                                        <span className="text-xl md:text-2xl font-black text-zinc-900 leading-none">🇮🇳</span>
                                        <span className="text-sm md:text-base font-black text-zinc-900 leading-none">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="Mobile Number"
                                        className="flex-1 bg-transparent px-4 py-3 md:py-4 outline-none font-black text-xl md:text-2xl placeholder:text-zinc-300 tracking-tight w-full"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-2 text-zinc-400 justify-center md:justify-start">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-zinc-500">100% Secure & Private</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length < 10}
                                className="group w-full bg-[#25D366] hover:bg-[#20BE5A] text-white font-black py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(37,211,102,0.25)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-sm md:text-base"
                            >
                                {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : (
                                    <>
                                        Get OTP on WhatsApp <MessageCircle className="w-5 h-5 fill-white/20" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex gap-2 sm:gap-4 justify-between max-w-sm mx-auto md:mx-0">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`checkout-otp-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        maxLength={1}
                                        className="w-12 h-16 sm:w-14 sm:h-16 text-center text-3xl font-black border-2 border-zinc-100 rounded-2xl focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 outline-none transition-all bg-white shadow-sm"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={loading || otp.some(d => !d)}
                                className="group w-full bg-zinc-900 hover:bg-black text-white font-black py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl md:shadow-2xl shadow-zinc-900/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-sm md:text-base"
                            >
                                {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : (
                                    <>
                                        Verify & Secure Order <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setStep('PHONE')}
                                className="w-full text-[10px] md:text-xs font-black text-zinc-400 hover:text-primary transition-colors uppercase tracking-widest text-center mb-4"
                            >
                                Use a different number
                            </button>

                            <div className="text-center">
                                {resendTimer > 0 ? (
                                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                        Resend OTP in {resendTimer}s
                                    </p>
                                ) : (
                                    <button
                                        onClick={() => handleSendOTP()}
                                        className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                                    >
                                        Didn't get the code? Resend
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-6 md:mt-8 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest px-4">
                By continuing, you agree to receive order notifications on WhatsApp.
            </p>
        </div>
    );
}
