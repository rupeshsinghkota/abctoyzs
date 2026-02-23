import { Metadata } from 'next';
import Link from "next/link";
import {
    CreditCard,
    ShieldCheck,
    Zap,
    ShieldAlert,
    RefreshCcw,
    Clock,
    CheckCircle2,
    Lock,
    Scale,
    Video,
    PhoneCall,
    Star
} from "lucide-react";
import { SettingsService } from '@/lib/services/settings';
import { BRAND_CONFIG } from '@/config/brand';

export async function generateMetadata(): Promise<Metadata> {
    const globalSEO = await SettingsService.getSEOConfig();
    const pageSEO = await SettingsService.getSegmentSEO('page_payment-policy');

    const title = pageSEO.defaultTitle || "Payment Policy - ABC Toyz";
    const description = pageSEO.defaultDescription || "Learn about our secure payment methods, Full Prepaid savings, and Verified Booking Advance for COD.";

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: globalSEO.ogImage ? [{ url: globalSEO.ogImage }] : [],
        }
    };
}

export default function PaymentPolicy() {
    const advanceAmount = BRAND_CONFIG.payment.codAdvanceAmount;
    const prepaidDiscount = BRAND_CONFIG.payment.prepaidDiscountPercentage;
    const prepaidCoupon = BRAND_CONFIG.payment.prepaidCouponCode;

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-zinc-100">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 md:p-14 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="relative z-10">
                            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Payment Trust Policy</h1>
                            <p className="text-indigo-100 text-lg font-medium max-w-xl leading-relaxed">
                                At ABC Toyz, we prioritize your security and peace of mind. Our transparent payment policy is designed to protect both the buyer and the seller.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-12">
                        {/* Option 1: Full Prepaid */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-emerald-100 rounded-2xl">
                                    <Zap className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900">Option 1: Full Prepaid Payment</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
                                    <h3 className="font-black text-emerald-900 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Instant Savings
                                    </h3>
                                    <p className="text-zinc-600 text-sm leading-relaxed">
                                        Use code <span className="font-black text-emerald-700">{prepaidCoupon}</span> to get flat {prepaidDiscount}% off on your entire order. This is a direct saving for our most trusted customers.
                                    </p>
                                </div>
                                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
                                    <h3 className="font-black text-emerald-900 mb-3 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Priority Processing
                                    </h3>
                                    <p className="text-zinc-600 text-sm leading-relaxed">
                                        Prepaid orders skip the manual verification queue and go directly to the quality-check and dispatch team.
                                    </p>
                                </div>
                            </div>

                            <p className="text-zinc-600 leading-relaxed italic">
                                *All prepaid transactions are processed through Razorpay's high-security gateway with 256-bit encryption.
                            </p>
                        </section>

                        {/* Option 2: Partial COD */}
                        <section className="bg-indigo-50/30 rounded-3xl p-8 border border-indigo-50">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-indigo-100 rounded-2xl">
                                    <CreditCard className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900">Option 2: Verified Booking Advance (COD)</h2>
                            </div>

                            <div className="prose prose-zinc max-w-none text-zinc-600 mb-8">
                                <p>
                                    As a premium retailer of heavy and high-value ride-on toys, we collect a small booking advance of <strong>₹{advanceAmount}</strong> for all Cash on Delivery (COD) orders.
                                </p>
                                <h4 className="text-zinc-900 font-bold mb-2">Why do we collect an advance?</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
                                        <span><strong>Anti-Fraud Protection:</strong> It ensures that the order is placed by a serious buyer, protecting us against "fake" or "junk" orders that hurt small businesses.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
                                        <span><strong>High Logistics Costs:</strong> Our toys are heavy and expensive to ship. The advance confirms your commitment so we can safely commit the shipping fee.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
                                        <span><strong>Genuine Order Service:</strong> We provide unit-specific videos and photos only to customers with confirmed paid bookings to maintain operational quality.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white border border-indigo-100 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
                                <ShieldAlert className="w-6 h-6 text-emerald-600 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-black text-zinc-900 mb-2">100% Refundable Policy</h4>
                                    <p className="text-zinc-600 text-sm leading-relaxed">
                                        Your booking advance is <strong>completely refundable</strong> if you change your mind for any reason before the order is dispatched. Once cancelled pre-dispatch, the refund is initiated within 2-3 business days.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* VIP Genuine Section */}
                        <section className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                                        <Star className="w-6 h-6 text-primary fill-primary" /> Genuine Order VIP Service
                                    </h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                        We treat our confirmed buyers as VIPs. Once your order is placed and the advance is paid, you gain exclusive access to our **Premium Verification Protocol**.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                                <PhoneCall className="w-4 h-4 text-primary" />
                                            </div>
                                            <p className="text-xs font-bold leading-tight">Post-order Verification Call within 1-2 hours</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                                <Video className="w-4 h-4 text-primary" />
                                            </div>
                                            <p className="text-xs font-bold leading-tight">Request Live Unit Videos/Photos on WhatsApp</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-primary/20 p-6 rounded-2xl border border-primary/30 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Exclusive Access</p>
                                    <p className="text-sm font-bold">Only paid bookings will be entertained for unit-specific details.</p>
                                </div>
                            </div>
                        </section>

                        {/* Payment Security */}
                        <section className="grid md:grid-cols-2 gap-12 pt-8 border-t border-zinc-100">
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 mb-4 flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-indigo-600" /> High-Level Security
                                </h3>
                                <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                                    We use <strong>Razorpay</strong>, India's most trusted payment gateway. Your card or bank details are never stored on our servers.
                                </p>
                                <div className="flex gap-4">
                                    <div className="px-3 py-1.5 bg-zinc-100 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">PCI-DSS Compliant</div>
                                    <div className="px-3 py-1.5 bg-zinc-100 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">256-Bit SSL Encryption</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 mb-4 flex items-center gap-3">
                                    <Scale className="w-5 h-5 text-indigo-600" /> GST & Taxes
                                </h3>
                                <p className="text-zinc-600 text-sm leading-relaxed">
                                    We are a 100% GST-registered business. Every payment you make is inclusive of all taxes, and you will receive a professional GST invoice with your delivery.
                                </p>
                            </div>
                        </section>

                        {/* Refund Timelines */}
                        <section>
                            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-indigo-600" /> Refund & Reversal Timelines
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <RefreshCcw className="w-5 h-5 text-zinc-400 mb-3" />
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Cancellation</p>
                                    <p className="text-sm font-black text-zinc-900 italic font-heading">Processed in 24 Hours</p>
                                </div>
                                <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <ShieldCheck className="w-5 h-5 text-zinc-400 mb-3" />
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Gateway Reversal</p>
                                    <p className="text-sm font-black text-zinc-900 italic font-heading">2-3 Working Days</p>
                                </div>
                                <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <CreditCard className="w-5 h-5 text-zinc-400 mb-3" />
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Bank Credit</p>
                                    <p className="text-sm font-black text-zinc-900 italic font-heading">5-7 Business Days</p>
                                </div>
                            </div>
                        </section>

                        {/* Contact */}
                        <div className="pt-10 border-t border-zinc-100 text-center">
                            <p className="text-zinc-500 text-sm mb-4 italic">Have questions about your payment?</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link href="https://wa.me/918239269217" className="text-emerald-600 font-black tracking-tight flex items-center gap-2 hover:scale-105 transition-transform">
                                    WhatsApp Support →
                                </Link>
                                <Link href="mailto:payments@abctoyz.in" className="text-indigo-600 font-black tracking-tight flex items-center gap-2 hover:scale-105 transition-transform">
                                    payments@abctoyz.in →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to Home/Checkout */}
                <div className="mt-8 flex justify-center gap-8">
                    <Link href="/checkout" className="text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">
                        ← Back to Checkout
                    </Link>
                    <Link href="/" className="text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">
                        Shop Collection
                    </Link>
                </div>
            </div>
        </div>
    );
}
