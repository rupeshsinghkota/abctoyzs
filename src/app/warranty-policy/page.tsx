import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';

import { SettingsService } from '@/lib/services/settings';

export async function generateMetadata(): Promise<Metadata> {
    const globalSEO = await SettingsService.getSEOConfig();
    const pageSEO = await SettingsService.getSegmentSEO('page_warranty-policy');

    const title = pageSEO.defaultTitle || "Warranty Policy | ABC Toyz";
    const description = pageSEO.defaultDescription || "Comprehensive 1-Year Warranty on ABC Toyz electric ride-on cars and bikes. Coverage details for motors, batteries, and more.";

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

export default function WarrantyPolicy() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100">
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-8">Warranty Policy</h1>
                    <p className="text-zinc-500 mb-8 italic">Last updated: February 17, 2026</p>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">1-Year Warranty Coverage</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            Every electric ride-on toy purchased from <strong>ABC Toyz</strong> comes with a comprehensive <strong>1-Year Warranty</strong> on critical components to ensure peace of mind for you and uninterrupted fun for your child.
                        </p>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mb-6">
                            <p className="text-zinc-700 text-sm">
                                <strong>Note:</strong> Warranty claims require a valid proof of purchase (Order ID/Invoice) and, in some cases, video evidence of the malfunction to help our technicians diagnose the issue remotely.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
                                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> What is Covered?</h3>
                                <ul className="list-disc pl-5 space-y-3 text-zinc-700 text-sm marker:text-green-500">
                                    <li><strong>Motors:</strong> Repair or free replacement if motors malfunction or stop working due to manufacturing defects.</li>
                                    <li><strong>Battery:</strong> Replacement if the battery fails to hold a charge or dies completely (excluding normal degradation from use).</li>
                                    <li><strong>Motherboard/Controller:</strong> Full coverage for remote control module or mainboard failure.</li>
                                    <li><strong>Charger:</strong> Replacement for faulty chargers causing charging issues.</li>
                                </ul>
                            </div>
                            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Exclusions (Not Covered)</h3>
                                <ul className="list-disc pl-5 space-y-3 text-zinc-700 text-sm marker:text-red-500">
                                    <li><strong>Physical Damage:</strong> Cracks, dents, or broken plastic parts caused by accidents, collisions, or mishandling.</li>
                                    <li><strong>Water Damage:</strong> Malfunctions caused by exposure to rain, standing water, or washing the vehicle with water.</li>
                                    <li><strong>Wear & Tear Parts:</strong> Items that naturally wear out, such as tires, stickers, seat leather, and decorative lights.</li>
                                    <li><strong>Overloading:</strong> Motor/Axle damage caused by exceeding the maximum weight capacity.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-zinc-800 mb-4">How to Claim Warranty</h2>
                        <ol className="list-decimal pl-6 space-y-4 text-zinc-600">
                            <li>
                                <strong>Contact Us:</strong> Reach out to our support team via Email or WhatsApp.
                            </li>
                            <li>
                                <strong>Diagnosis:</strong> Share a video of the issue. Our technical team will inspect it remotely.
                            </li>
                            <li>
                                <strong>Resolution:</strong> If the part is faulty and covered, we will ship a replacement part to your address free of cost. We also provide video tutorials on how to easily replace the part at home.
                            </li>
                        </ol>
                    </section>

                    <section className="mb-10 border-t border-zinc-100 pt-10">
                        <h2 className="text-2xl font-semibold text-zinc-800 mb-4">Contact for Support</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-bold text-zinc-900">Email</p>
                                    <Link href="mailto:support@abctoyz.in" className="text-sm text-zinc-600 hover:text-primary">support@abctoyz.in</Link>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-bold text-zinc-900">WhatsApp</p>
                                    <p className="text-sm text-zinc-600">+91 82392 69217</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-bold text-zinc-900">Service Hub</p>
                                    <p className="text-sm text-zinc-600">Shop No 123A, Jhandewalan Toy Market, New Delhi - 110055</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
