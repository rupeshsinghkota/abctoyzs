import type { Metadata } from 'next';
import Link from 'next/link';
import { Video, Calendar, RefreshCcw, ShieldCheck, Clock, PhoneCall, ArrowLeft, IndianRupee } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Live Video Call Booking Policy | ABC Toyz',
    description: 'Learn about our Live Video Call booking terms — what you get, cancellation, refunds, and rescheduling policy at ABC Toyz.',
};

const sections = [
    {
        icon: Video,
        title: '1. What You Get',
        color: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-100',
        points: [
            'A private 15-minute live video call via Google Meet.',
            'Our team shows the exact physical unit of your selected product.',
            'See real colors, size, features, and working functions live.',
            'Ask any questions — battery life, sound, remote range, and more.',
        ],
    },
    {
        icon: Calendar,
        title: '2. Commitment & Cancellation',
        color: 'text-red-500',
        bg: 'bg-red-50 border-red-100',
        points: [
            'Our showroom slots are limited and in high demand.',
            'If you cannot attend, please cancel at least 2 hours in advance.',
            'Frequent no-shows may lead to a temporary block from booking live tours.',
            'To cancel, WhatsApp us at +91 82392 69217.',
        ],
    },
    {
        icon: RefreshCcw,
        title: '3. Rescheduling',
        color: 'text-green-600',
        bg: 'bg-green-50 border-green-100',
        points: [
            'You may reschedule your slot once at no extra cost.',
            'Rescheduling request must be made at least 1 hour before the original slot.',
            'Contact us on WhatsApp: +91 82392 69217 to reschedule.',
        ],
    },
    {
        icon: ShieldCheck,
        title: '4. Completely Free Service',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50 border-indigo-100',
        points: [
            'This is a premium service provided for free to genuine customers.',
            'No credit card or commitment fee is required to book a slot.',
            'Experience our products from the comfort of your home before making a decision.',
        ],
    },
    {
        icon: PhoneCall,
        title: '5. Contact & Support',
        color: 'text-zinc-700',
        bg: 'bg-zinc-50 border-zinc-200',
        points: [
            'WhatsApp: +91 82392 69217 (9 AM – 7 PM, Mon–Sat)',
            'Email: support@abctoyz.in',
            'We aim to respond within 1–2 hours during business hours.',
        ],
    },
];

export default function BookingPolicyPage() {
    return (
        <main className="min-h-screen bg-gray-50/50">
            {/* Hero */}
            <div className="bg-zinc-950 text-white">
                <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-6">
                        <Video className="w-3.5 h-3.5" /> Live Video Call
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
                        Booking Policy
                    </h1>
                    <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
                        Everything you need to know about booking, cancelling, and rescheduling your private live video tour at ABC Toyz.
                    </p>
                    <p className="text-zinc-600 text-xs mt-6 font-medium">
                        Last updated: March 2026
                    </p>
                </div>
            </div>

            {/* Highlight Bar */}
            <div className="bg-primary text-white py-4">
                <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-bold text-center">
                    <span>✅ 100% Free Experience</span>
                    <span className="hidden sm:block text-white/40">•</span>
                    <span>🎥 15-Min Private Live Call</span>
                    <span className="hidden sm:block text-white/40">•</span>
                    <span>🤝 No Commitment Required</span>
                </div>
            </div>

            {/* Policy Sections */}
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-6">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div
                            key={section.title}
                            className={`rounded-2xl border p-6 md:p-8 ${section.bg}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-9 h-9 rounded-xl bg-white border shadow-sm flex items-center justify-center ${section.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-black text-zinc-900">{section.title}</h2>
                            </div>
                            <ul className="space-y-2.5">
                                {section.points.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 font-medium leading-relaxed">
                                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${section.color} bg-current`} />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}

                {/* CTA */}
                <div className="bg-zinc-950 rounded-2xl p-8 text-center space-y-4 mt-8">
                    <Video className="w-8 h-8 text-primary mx-auto" />
                    <h3 className="text-2xl font-black text-white tracking-tight">Ready to See It Live?</h3>
                    <p className="text-zinc-400 text-sm font-medium max-w-sm mx-auto">
                        Book your private 15-minute video tour today. It's completely free and available to book right at checkout.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-black text-sm rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-primary/30 mt-2"
                    >
                        Browse Products & Book a Call
                    </Link>
                </div>

                {/* Back link */}
                <div className="pt-4 pb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
