"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Phone, ArrowRight, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthStep = 'phone' | 'otp' | 'loading' | 'success';

export function AuthForm() {
    const [step, setStep] = useState<AuthStep>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(0);

    const router = useRouter();
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get('next') || '/profile';

    // Timer for resend button
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (phone.length < 10) {
            setError('Please enter a valid 10-digit number');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `91${phone.replace(/\D/g, '').slice(-10)}` }), // Ensure 91 prefix for India
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

            setStep('otp');
            setResendTimer(30);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otpValue?: string) => {
        const fullOtp = otpValue || otp.join('');
        if (fullOtp.length !== 6) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: `91${phone.replace(/\D/g, '').slice(-10)}`,
                    code: fullOtp
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid code');

            // 1. Redirect to the session link (magic link) to set cookies
            if (data.session_link) {
                window.location.href = data.session_link;
            } else {
                // Fallback: Refresh and redirect
                router.refresh();
                router.push(nextUrl);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        // If all filled, verify
        if (newOtp.every(digit => digit !== '')) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row overflow-hidden rounded-[2.5rem] shadow-2xl bg-white border border-zinc-100 min-h-[600px] animate-in fade-in duration-700">
            {/* Left Side - Visual & Brand */}
            <div className="hidden md:flex md:w-1/2 bg-zinc-950 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="relative z-10 text-white max-w-sm">
                    <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        Secure Login
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter mb-6 leading-[1.1]">
                        The Joy of <br />
                        <span className="text-primary italic">Ride-Ons.</span>
                    </h2>
                    <p className="text-zinc-300 text-lg font-medium leading-relaxed mb-8">
                        Experience the fastest way to shop. Log in with WhatsApp and track your toys in real-time.
                    </p>
                    <div className="flex items-center gap-4 text-sm font-bold text-zinc-400">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-xs overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p>Join 10,000+ parents</p>
                    </div>
                </div>
                {/* Abstract Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-40 -mb-40"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
                <div className="max-w-sm mx-auto w-full space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-black font-heading text-zinc-900 tracking-tight mb-3">
                            {step === 'phone' ? 'Fast Sign In' : 'Verification'}
                        </h2>
                        <p className="text-zinc-500 font-medium">
                            {step === 'phone'
                                ? 'We\'ll send a secure code to your WhatsApp'
                                : `Enter the 6-digit code sent to ${phone}`}
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-3xl bg-red-50 text-red-600 text-[13px] font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Step 1: Phone Input */}
                    {step === 'phone' && (
                        <form onSubmit={handleSendOTP} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">WhatsApp Number</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-zinc-400 border-r pr-3 py-1 bg-transparent group-focus-within:text-zinc-900 transition-colors">
                                        <span className="text-sm font-black">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        required
                                        autoFocus
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-[1.5rem] pl-[4.5rem] pr-6 py-5 text-base font-black text-zinc-800 focus:bg-white focus:ring-[6px] focus:ring-primary/5 focus:border-primary transition-all placeholder:text-zinc-300 outline-none"
                                        placeholder="9876543210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-200 group-focus-within:text-primary transition-colors">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length < 10}
                                className="group w-full bg-zinc-900 text-white h-16 rounded-[1.5rem] font-black text-base shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Get Verification Code
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-[11px] text-center text-zinc-400 font-medium px-4">
                                By continuing, you agree to receive a secure OTP on WhatsApp. Standard operator charges may apply.
                            </p>
                        </form>
                    )}

                    {/* Step 2: OTP Input */}
                    {step === 'otp' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        autoFocus={idx === 0}
                                        className="w-12 h-16 md:w-14 md:h-20 bg-zinc-50 border border-zinc-100 rounded-2xl text-center text-2xl font-black text-zinc-900 focus:bg-white focus:ring-[6px] focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleVerifyOTP()}
                                    disabled={loading || otp.some(d => !d)}
                                    className="w-full bg-zinc-900 text-white h-16 rounded-[1.5rem] font-black text-base shadow-xl hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        "Verify & Continue"
                                    )}
                                </button>

                                <div className="flex items-center justify-between px-2">
                                    <button
                                        onClick={() => setStep('phone')}
                                        className="text-xs font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                                    >
                                        Change Number
                                    </button>

                                    <button
                                        onClick={handleSendOTP}
                                        disabled={resendTimer > 0}
                                        className="text-xs font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest disabled:text-zinc-300"
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Trust Signal */}
                    <div className="pt-8 border-t border-zinc-50">
                        <div className="flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                            <div className="flex flex-col items-center">
                                <div className="p-2 bg-zinc-100 rounded-lg mb-1">
                                    <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="p-2 bg-zinc-100 rounded-lg mb-1">
                                    <ShieldCheck className="w-4 h-4 text-zinc-900" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tighter">Secure</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="p-2 bg-zinc-100 rounded-lg mb-1">
                                    <MessageSquare className="w-4 h-4 text-zinc-900" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tighter">Fast</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
