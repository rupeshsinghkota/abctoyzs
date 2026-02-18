"use client";

import { useState } from "react";
import { Loader2, ArrowRight, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface FastCheckoutOverlayProps {
    onVerified: (user: any) => void;
    onClose: () => void;
}

export function FastCheckoutOverlay({ onVerified, onClose }: FastCheckoutOverlayProps) {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) return toast.error("Please enter a valid number");

        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            toast.success("OTP sent to WhatsApp!");
            setStep('OTP');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 6) return toast.error("Please enter full OTP");

        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Set Supabase session if link provided (optional, but good for persistence)
            if (data.session_link) {
                // We could auto-login here via magic link but for now we just callback
                // Simpler: Just rely on the user object returned
            }

            toast.success("Verified!");
            onVerified(data.user);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Prevent paste overflow for now
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {step === 'PHONE' ? 'Fast Checkout' : 'Verify & Continue'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 'PHONE'
                            ? 'Enter your number to track order & get updates'
                            : `Enter OTP sent to +91 ${phone}`
                        }
                    </p>
                </div>

                {step === 'PHONE' ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-gray-700 ml-1">Mobile Number</label>
                            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <div className="bg-gray-100 px-4 py-3 text-gray-500 font-medium border-r border-gray-200 flex items-center">
                                    🇮🇳 +91
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter 10-digit number"
                                    className="flex-1 bg-transparent px-4 py-3 outline-none font-medium placeholder:text-gray-400"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || phone.length < 10}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Send Verification Code <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex gap-2 justify-center">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`otp-${idx}`}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    maxLength={1}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={loading || otp.some(d => !d)}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Verify & Checkout <ShieldCheck className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setStep('PHONE')}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Change Number
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-[10px] text-gray-400">
                        By continuing, you verify that you are authorized to use this number and agree to receive SMS/WhatsApp updates.
                    </p>
                </div>
            </div>
        </div>
    );
}
