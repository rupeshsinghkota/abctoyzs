import { Metadata } from 'next';
import Link from "next/link";
import { Shield, Lock, Eye, Bell } from "lucide-react";

export const metadata: Metadata = {
    title: 'Privacy Policy | Data Protection',
    description: 'Our commitment to protecting your privacy at ABC Toyz. Learn how we collect, use, and safeguard your personal information.',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-8">Privacy Policy</h1>
                    <p className="text-zinc-500 mb-8 italic">Last updated: February 5, 2024</p>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Introduction</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            At <strong>ABC Toyz</strong>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or make a purchase.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Information We Collect</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            When you visit ABC Toyz, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-600">
                            <li><strong>Personal Identifiers:</strong> Name, shipping address, billing address, payment information, email address, and phone number.</li>
                            <li><strong>Device Information:</strong> Version of web browser, IP address, time zone, cookie information, what sites or products you view, and how you interact with the Site.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">How We Use Your Information</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            We use the personal information we collect to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-600">
                            <li>Process and fulfill your orders, including shipping and payment processing.</li>
                            <li>Communicate with you regarding your orders or inquiries.</li>
                            <li>Screen our orders for potential risk or fraud.</li>
                            <li>Provide you with information or advertising relating to our products or services (if you have opted in).</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Sharing Your Personal Information</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            We share your Personal Information with third parties to help us use your Personal Information, as described above. For example:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-600">
                            <li>We use Razorpay to power our online store and payments.</li>
                            <li>We use Google Analytics to help us understand how our customers use the Site.</li>
                            <li>We may share your Personal Information to comply with applicable laws and regulations.</li>
                        </ul>
                    </section>

                    <section className="mb-10 border-t border-zinc-100 pt-10">
                        <h2 className="text-2xl font-semibold text-zinc-800 mb-4">Contact Us</h2>
                        <p className="text-zinc-600 leading-relaxed">
                            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <Link href="mailto:support@abctoyz.in" className="text-primary hover:underline">support@abctoyz.in</Link> or by mail using the details provided below:
                        </p>
                        <address className="mt-4 text-zinc-600 not-italic">
                            ABC Toyz<br />
                            Jhandewalan Toy Market, Near Videocon Tower,<br />
                            New Delhi - 110055,<br />
                            India
                        </address>
                    </section>
                </div>
            </div>
        </div>
    );
}
