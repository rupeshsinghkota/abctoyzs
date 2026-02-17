import { Metadata } from 'next';
import { Truck, Clock, ShieldCheck, MapPin, CheckCircle2, CreditCard, Zap, Banknote } from "lucide-react";

import { SettingsService } from '@/lib/services/settings';

export async function generateMetadata(): Promise<Metadata> {
    const globalSEO = await SettingsService.getSEOConfig();
    const pageSEO = await SettingsService.getSegmentSEO('page_shipping-policy');

    const title = pageSEO.defaultTitle || globalSEO.defaultTitle;
    const description = pageSEO.defaultDescription || globalSEO.defaultDescription;

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

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-8 tracking-tight">Shipping Policy</h1>
                    <p className="text-zinc-500 mb-10 italic">Last updated: February 17, 2026</p>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Delivery & Handling Timelines</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-6">
                            To ensure transparency, we provide clear estimates for every stage of your order's journey. All orders are processed during our business hours (Mon-Sat, 9am-7pm).
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Order Handling</p>
                                <p className="text-zinc-900 font-bold text-lg">0 - 1 Business Day</p>
                                <p className="text-zinc-500 text-xs mt-1">Time to pack and dispatch</p>
                            </div>
                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Transit Time</p>
                                <p className="text-zinc-900 font-bold text-lg">1 - 4 Business Days</p>
                                <p className="text-zinc-500 text-xs mt-1">Time from courier pickup to delivery</p>
                            </div>
                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Order Cut-off</p>
                                <p className="text-zinc-900 font-bold text-lg">4:00 PM IST</p>
                                <p className="text-zinc-500 text-xs mt-1">Orders after this ship next day</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 p-8 rounded-[2rem] text-white">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Zone-Wise Estimates
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-400">Delhi NCR</span>
                                    <span className="font-bold">1 - 2 Days</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-400">Metro Cities</span>
                                    <span className="font-bold">2 - 3 Days</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-400">Rest of India</span>
                                    <span className="font-bold">3 - 4 Days</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-400">Remote Zones</span>
                                    <span className="font-bold">5 - 7 Days</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-800 pb-2 col-span-full pt-2">
                                    <span className="text-zinc-400">Service Area</span>
                                    <span className="text-primary font-bold">India Only</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Truck className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Shipping Partners & Cost</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            We partner with premium courier services like <strong>BlueDart, Delhivery, and XpressBees</strong> to ensure your ride-on toy reaches you safely and on time.
                        </p>
                        <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-bold text-sm border border-green-100">
                            <CheckCircle2 className="w-4 h-4" />
                            Free Standard Shipping on All Orders
                        </p>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Payment Methods</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-6">
                            We offer flexible payment options to ensure a secure and convenient shopping experience. You can choose from the following methods at checkout:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:border-primary/20 transition-all">
                                <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-primary" />
                                    Full Prepayment
                                </h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    Pay the full amount online using UPI, Cards, or Netbanking. Orders with full prepayment are prioritized for faster dispatch and delivery.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:border-primary/20 transition-all">
                                <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
                                    <Banknote className="w-4 h-4 text-primary" />
                                    COD (with Advance)
                                </h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    For large items, we offer Cash on Delivery with a <strong>₹500 prepayment</strong>. The remaining balance is payable in cash at the time of delivery.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12 border-t border-zinc-100 pt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Order Tracking</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed">
                            Once your order is dispatched, you will receive a tracking link via email and WhatsApp. You can also track your order directly from your profile on our website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
