import { Metadata } from 'next';
import Link from "next/link";
import { RefreshCcw, AlertCircle, Video, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

import { SettingsService } from '@/lib/services/settings';

export async function generateMetadata(): Promise<Metadata> {
    const globalSEO = await SettingsService.getSEOConfig();
    const pageSEO = await SettingsService.getSegmentSEO('page_refund-policy');

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

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100">
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-8">Refund & Warranty Policy</h1>
                    <p className="text-zinc-500 mb-8 italic">Last updated: February 17, 2026</p>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-10">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold text-amber-900 mb-2">Important Notice: Unboxing Video Mandatory</h3>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    To protect our customers and ensure a smooth claim process, an <strong>unboxing video is mandatory</strong> for all claims regarding damage, missing items, or manufacturing defects. Claims without a clear, continuous unboxing video will not be entertained.
                                </p>
                            </div>
                        </div>
                    </div>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCcw className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">10-Day Replacement Policy</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            At <strong>ABC Toyz</strong>, we want you and your little ones to be thrilled with your purchase. We offer a <strong>10-day replacement window</strong> for any items received with manufacturing defects or shipping damage.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-600">
                            <li>Replacements are only available for defective/damaged products.</li>
                            <li>Returns for "change of mind" are not accepted due to the high shipping costs of large items.</li>
                            <li><strong>Free Reverse Pickup:</strong> We arrange and pay for the return shipping of all approved claims.</li>
                            <li><strong>No Restocking Fees:</strong> There are zero fees associated with returning a defective item.</li>
                            <li>The item must be in its original packaging with all accessories included.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Order Cancellation Policy</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            We understand that plans can change. You can cancel your order under the following conditions:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-600">
                            <li><strong>Pre-Dispatch:</strong> Full refund is initiated if the order is cancelled before it leaves our facility (within 24 hours of order).</li>
                            <li><strong>In-Transit:</strong> If an order is cancelled while in transit, the forward and reverse shipping charges will be deducted from the refund amount.</li>
                            <li><strong>COD Advance:</strong> The ₹500 COD advance is non-refundable if the order is refused at the doorstep for reasons other than damage.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Video className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">How to File a Claim</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            If you receive a damaged or defective product, please follow these steps:
                        </p>
                        <ol className="list-decimal pl-6 space-y-4 text-zinc-600">
                            <li>
                                <strong>Record Unboxing:</strong> Start recording <em>before</em> you open the package. Show the shipping label clearly, and keep the camera running without pauses until the product is assembled or tested.
                            </li>
                            <li>
                                <strong>Contact Us:</strong> Email your claim to <Link href="mailto:support@abctoyz.in" className="text-primary hover:underline">support@abctoyz.in</Link> within 48 hours of delivery.
                            </li>
                            <li>
                                <strong>Provide Proof:</strong> Attach the unboxing video and high-resolution photos of the defect/damage.
                            </li>
                        </ol>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCcw className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Return & Replacement Process</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-6">
                            We provide a seamless replacement process for defective or damaged items. Since our products are large and heavy, we manage the reverse logistics carefully.
                        </p>

                        <div className="space-y-6">
                            {[
                                { step: "01", title: "Submit Request", desc: "Email support@abctoyz.in within 48h of delivery with your unboxing video." },
                                { step: "02", title: "Approval", desc: "Our technicians review the footage (usually within 24 hours)." },
                                { step: "03", title: "Reverse Pickup", desc: "We arrange a free pickup from your address once approved." },
                                { step: "04", title: "Quality Check", desc: "The item is inspected at our hub for the reported defect." },
                                { step: "05", title: "Resolution", desc: "A fresh replacement is dispatched, or a full refund is initiated." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="text-primary font-black text-xl opacity-20">{item.step}</div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900">{item.title}</h4>
                                        <p className="text-sm text-zinc-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Refund Timelines</h2>
                        </div>
                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                            <p className="text-zinc-600 leading-relaxed">
                                If a replacement is not available or you are eligible for a refund, the amount will be credited back to your original payment method.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-zinc-100">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Processing Time</span>
                                    <span className="text-sm font-bold text-zinc-900">2-3 Days</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-zinc-100">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bank Credit</span>
                                    <span className="text-sm font-bold text-zinc-900">5-7 Business Days</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">1-Year Warranty Policy</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            Every electric ride-on toy purchased from <strong>ABC Toyz</strong> comes with a comprehensive <strong>1-Year Warranty</strong> on critical components to ensure peace of mind.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
                                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> What is Covered?</h3>
                                <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm marker:text-green-500">
                                    <li><strong>Motors:</strong> Repair or replacement if motors malfunction.</li>
                                    <li><strong>Battery:</strong> Replacement if battery fails completely (excluding normal wear).</li>
                                    <li><strong>Motherboard:</strong> Coverage for remote/control module failure.</li>
                                </ul>
                            </div>
                            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Exclusions</h3>
                                <ul className="list-disc pl-5 space-y-2 text-zinc-700 text-sm marker:text-red-500">
                                    <li>Physical damage (accidents, broken plastic).</li>
                                    <li>Water damage or rain exposure.</li>
                                    <li>Wear/Tear items (Tires, stickers, seats).</li>
                                    <li>Overloading weight capacity.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10 border-t border-zinc-100 pt-10">
                        <h2 className="text-2xl font-semibold text-zinc-800 mb-4">Contact for Claims</h2>
                        <p className="text-zinc-600 leading-relaxed">
                            Email: <Link href="mailto:support@abctoyz.in" className="text-primary hover:underline">support@abctoyz.in</Link><br />
                            WhatsApp: +91 82392 69217<br />
                            Address: Jhandewalan Toy Market, Near Videocon Tower, New Delhi - 110055
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
