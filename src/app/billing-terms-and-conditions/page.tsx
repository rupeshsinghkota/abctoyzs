import { Metadata } from 'next';
import { CreditCard, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { SettingsService } from '@/lib/services/settings';

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

export default function BillingTerms() {
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
                            Your security is our top priority. All transactions on <strong>abcToyz</strong> are processed through secure, encrypted payment gateways. We use <strong>SSL (Secure Sockets Layer)</strong> technology to ensure that your personal and payment information is kept safe and private.
                        </p>
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
                                <h3 className="font-bold text-zinc-900 mb-2">2. COD with ₹500 Prepayment</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    For large ride-on toys, we offer Cash on Delivery with a mandatory ₹500 advance payment to confirm the order. The balance amount is payable to the courier at the time of delivery.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12 border-t border-zinc-100 pt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Pricing & Taxes</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed">
                            All prices listed on our website are inclusive of GST. There are no hidden charges. The total price you see at checkout is the final price you pay.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
