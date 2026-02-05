import { Metadata } from 'next';
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react";

export const metadata: Metadata = {
    title: 'Shipping Policy | Delivery Timelines',
    description: 'Information about shipping and delivery for ABC Toyz. We offer fast 24-48 hour dispatch and secure Pan-India delivery for all our ride-on toys.',
};

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-8 tracking-tight">Shipping Policy</h1>
                    <p className="text-zinc-500 mb-10 italic">Last updated: February 5, 2024</p>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Dispatch Timeline</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            We know you're excited to receive your order! Most orders are processed and dispatched within <strong>24-48 hours</strong> of payment verification.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <p className="text-sm font-bold text-zinc-900 mb-1">Metro Cities</p>
                                <p className="text-zinc-600 text-sm">3-5 days</p>
                            </div>
                            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <p className="text-sm font-bold text-zinc-900 mb-1">Rest of India</p>
                                <p className="text-zinc-600 text-sm">5-7 days</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Truck className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Shipping Partners</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            We partner with premium courier services like BlueDart, Delhivery, and XpressBees to ensure your ride-on toy reaches you safely and on time.
                        </p>
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
