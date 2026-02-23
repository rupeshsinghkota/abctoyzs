import { Metadata } from 'next';
import { CreditCard, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { SettingsService } from '@/lib/services/settings';
import { BRAND_CONFIG } from '@/config/brand';

export async function generateMetadata(): Promise<Metadata> {
    const globalSEO = await SettingsService.getSEOConfig();
    const pageSEO = await SettingsService.getSegmentSEO('page_billing-terms');

    const title = "Billing Terms & Conditions | abcToyz";
    const description = "Understand our secure payment processing, accepted payment methods, and billing terms.";

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

export default async function BillingTerms() {
    const settings = await SettingsService.getSettings();
    const advanceAmount = settings?.cod_advance_value || BRAND_CONFIG.payment.codAdvanceAmount;
    const advanceType = settings?.cod_advance_type || BRAND_CONFIG.payment.codAdvanceType;
    const displayAdvance = advanceType === 'percentage' ? `${advanceAmount}%` : `₹${advanceAmount.toLocaleString()}`;

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-8">Billing Terms & Conditions</h1>
                    <p className="text-zinc-500 mb-10 italic">Last updated: February 17, 2026</p>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Secure Payment Processing</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-6">
                            Your security is our top priority. All transactions on <strong>abcToyz</strong> are processed through secure, encrypted payment gateways provided by <strong>Razorpay</strong>. We use <strong>SSL (Secure Sockets Layer)</strong> technology to ensure that your personal and payment information is kept safe and private.
                        </p>
                        <div className="bg-green-50/50 border border-green-100 rounded-lg p-4 flex items-start gap-3">
                            <Lock className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-green-800">
                                <strong>Data Security Guarantee:</strong> We do not store your credit card or banking details on our servers. All sensitive payment data is handled directly by our PCI-DSS compliant payment partner.
                            </p>
                        </div>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Accepted Payment Methods</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-6">
                            We accept a wide range of payment methods to make your shopping experience seamless:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                "UPI (GPay, PhonePe)",
                                "Credit/Debit Cards",
                                "Net Banking",
                                "Wallets",
                                "Visa / Mastercard",
                                "Rupay",
                                "Amex",
                                "EMI Options"
                            ].map((method) => (
                                <div key={method} className="bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100 text-sm font-medium text-zinc-700 flex items-center justify-center text-center">
                                    {method}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Lock className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Payment Options</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                                <h3 className="font-bold text-zinc-900 mb-2">1. Full Prepayment</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Pay the full amount during checkout for priority processing and faster dispatch.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                                <h3 className="font-bold text-zinc-900 mb-2">2. COD with {displayAdvance} Prepayment</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    For high-value ride-on toys, we offer Cash on Delivery with a mandatory {displayAdvance} advance payment to confirm the order. The balance amount is payable to the courier at the time of delivery.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Pricing & Taxes</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed">
                            All prices listed on our website are inclusive of GST. There are no hidden charges. The total price you see at checkout is the final price you pay.
                        </p>
                    </section>

                    <section className="pt-10 border-t border-zinc-100">
                        <h2 className="text-xl font-bold text-zinc-900 mb-4">Billing Inquiries</h2>
                        <p className="text-zinc-600 mb-4">
                            For any queries related to billing, payments, or refunds, please contact our support team.
                        </p>
                        <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-2">
                            <p className="font-bold text-zinc-900">ABC Toyz</p>
                            <p className="text-sm text-zinc-600">Shop No 123A, Jhandewalan Toy Market, Near Videocon Tower, New Delhi - 110055</p>
                            <p className="text-sm text-zinc-600">Email: <a href="mailto:support@abctoyz.in" className="text-primary hover:underline">support@abctoyz.in</a></p>
                            <p className="text-sm text-zinc-600">Phone: +91 82392 69217</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
