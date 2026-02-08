"use client";

import React, { useState } from "react";
import {
    Mail, Phone, MapPin, Send, MessageCircle, Clock,
    Share2, ShieldCheck, HelpCircle, Building2, User
} from "lucide-react";

export default function ContactUsClient() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert("Thank you for your message! Our concierge team will get back to you within 24 hours.");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16 font-sans">
            <div className="container max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-top-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6">
                        <Share2 className="w-4 h-4" />
                        Always Connected
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-6">
                        Let's Start a <br />
                        <span className="text-primary italic">Conversation.</span>
                    </h1>
                    <p className="text-zinc-500 text-lg md:text-xl leading-relaxed">
                        Whether you're looking for your child's first electric supercar or need technical support for an existing ride-on, our D2BCart concierge team is ready to assist.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
                    {/* Contact Info Column */}
                    <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
                            <h2 className="text-2xl font-black text-zinc-900 mb-8 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-primary" />
                                Visit Our Hub
                            </h2>
                            <div className="space-y-8">
                                <InfoItem
                                    icon={<MapPin className="w-5 h-5" />}
                                    title="Showroom & HQ"
                                    detail="Jhandewalan Toy Market, Near Videocon Tower, New Delhi - 110055"
                                    sub="A Brand of D2BCart"
                                />
                                <InfoItem
                                    icon={<Clock className="w-5 h-5" />}
                                    title="Business Hours"
                                    detail="Monday - Saturday"
                                    sub="09:00 AM - 07:00 PM IST"
                                />
                                <InfoItem
                                    icon={<Phone className="w-5 h-5" />}
                                    title="Direct Hotline"
                                    detail="+91 80004 21913"
                                    sub="Call or WhatsApp for Instant Help"
                                />
                            </div>
                        </div>

                        <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white">
                            <h3 className="text-xl font-bold mb-4">Fastest Response?</h3>
                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                Our WhatsApp support is active 10 hours a day for live video calls, assembly guidance, and order tracking.
                            </p>
                            <a
                                href="https://wa.me/918000421913"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white w-full py-4 rounded-xl font-bold transition-all justify-center shadow-lg shadow-green-900/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                                <Mail className="w-64 h-64" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-zinc-900 mb-2">Send an Inquiry</h2>
                                <p className="text-zinc-500 mb-10 font-medium">We typically respond within 2-4 business hours.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Inquiry Type</label>
                                        <select
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium appearance-none"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        >
                                            <option value="">Select a subject...</option>
                                            <option value="Sales">Buying a New Ride-On</option>
                                            <option value="Support">Technical Support & Warranty</option>
                                            <option value="Order">Order Status & Tracking</option>
                                            <option value="B2B">Wholesale & Partnership</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Your Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium resize-none"
                                            placeholder="Tell us how we can help you today..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary hover:bg-zinc-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-primary/20 disabled:opacity-50 text-lg"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Inquiry
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Transparency Section */}
                <div className="bg-zinc-100 rounded-[3rem] p-12 border border-zinc-200 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <RegistryItem
                            icon={<User className="w-6 h-6" />}
                            label="Legal Entity"
                            value="D2BCart"
                        />
                        <RegistryItem
                            icon={<ShieldCheck className="w-6 h-6" />}
                            label="Merchant Head"
                            value="Rupesh Singh"
                        />
                        <RegistryItem
                            icon={<MapPin className="w-6 h-6" />}
                            label="City of Operations"
                            value="New Delhi, India"
                        />
                        <RegistryItem
                            icon={<HelpCircle className="w-6 h-6" />}
                            label="Support SLA"
                            value="24h Guaranteed"
                        />
                    </div>
                </div>

                {/* FAQ Snippet */}
                <div className="text-center">
                    <p className="text-zinc-400 font-medium italic">
                        By contacting us, you agree to our <Link href="/privacy-policy" className="text-zinc-600 underline hover:text-primary transition-colors">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, title, detail, sub }: { icon: React.ReactNode; title: string; detail: string; sub: string }) {
    return (
        <div className="flex gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-zinc-900 font-bold leading-tight mb-0.5">{detail}</p>
                <p className="text-zinc-500 text-xs font-medium italic">{sub}</p>
            </div>
        </div>
    );
}

function RegistryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="space-y-3">
            <div className="text-primary opacity-50">{icon}</div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
                <p className="text-zinc-900 font-bold">{value}</p>
            </div>
        </div>
    );
}
