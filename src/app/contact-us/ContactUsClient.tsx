"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";

export default function ContactUsClient() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Thank you for your message! We will get back to you soon.");
    };

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-extrabold text-zinc-900 mb-4 tracking-tight">Get in Touch</h1>
                            <p className="text-zinc-500 text-lg leading-relaxed">
                                Have a question about our ride-ons? Need help with an order? Our team is here to help you every step of the way.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <ContactCard
                                icon={<MapPin className="w-6 h-6" />}
                                title="Our Showroom"
                                detail="Jhandewalan Toy Market, Near Videocon Tower, New Delhi - 110055"
                                subDetail="A Brand of D2BCart"
                            />
                            <ContactCard
                                icon={<Phone className="w-6 h-6" />}
                                title="Phone Support"
                                detail="+91 80004 21913"
                                subDetail="Mon-Sat, 9am - 7pm"
                            />
                            <ContactCard
                                icon={<Mail className="w-6 h-6" />}
                                title="Email Us"
                                detail="support@abctoyz.in"
                                subDetail="We reply within 24 hours"
                            />
                        </div>

                        <div className="pt-6">
                            <a
                                href="https://wa.me/918000421913"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-green-200"
                            >
                                <MessageCircle className="w-6 h-6" />
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-8">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 ml-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 ml-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Order Inquiry"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 ml-1">Your Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    placeholder="How can we help?"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 mt-4"
                            >
                                <Send className="w-5 h-5" />
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactCard({ icon, title, detail, subDetail }: { icon: React.ReactNode; title: string; detail: string; subDetail?: string }) {
    return (
        <div className="flex gap-4 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-hover hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{title}</p>
                <p className="text-zinc-700 font-medium mt-1">{detail}</p>
                {subDetail && <p className="text-zinc-400 text-sm mt-0.5">{subDetail}</p>}
            </div>
        </div>
    );
}
