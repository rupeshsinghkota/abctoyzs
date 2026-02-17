"use client";

import React from "react";
import Link from "next/link";
import { List, Map, ShoppingCart, Info, ShieldCheck, Mail } from "lucide-react";

export default function Sitemap() {
    const sections = [
        {
            title: "Main Pages",
            icon: <Map className="w-5 h-5 text-primary" />,
            links: [
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about-us" },
                { label: "Contact Us", href: "/contact-us" },
                { label: "Sitemap", href: "/site-map" },
            ]
        },
        {
            title: "Shop Categories",
            icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
            links: [
                { label: "Electric Cars", href: "/category/cars" },
                { label: "Motorcycles", href: "/category/bikes" },
                { label: "Jeeps & SUVs", href: "/category/jeeps" },
                { label: "ATVs & Buggies", href: "/category/atvs" },
                { label: "Electric Scooters", href: "/category/scooters" },
                { label: "Spare Parts", href: "/category/parts" },
            ]
        },
        {
            title: "Policy Pages",
            icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
            links: [
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Refund & Return Policy", href: "/refund-policy" },
                { label: "Shipping & Delivery", href: "/shipping-policy" },
            ]
        },
        {
            title: "Customer Support",
            icon: <Mail className="w-5 h-5 text-orange-500" />,
            links: [
                { label: "Contact Form", href: "/contact-us" },
                { label: "WhatsApp Support", href: "https://wa.me/918239269217" },
                { label: "My Account", href: "/profile" },
                { label: "My Orders", href: "/orders" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-zinc-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <List className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Sitemap</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {sections.map((section, idx) => (
                            <div key={idx} className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                                    {section.icon}
                                    <h2 className="text-xl font-bold text-zinc-800">{section.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.links.map((link, lIdx) => (
                                        <li key={lIdx}>
                                            <Link
                                                href={link.href}
                                                className="text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 group-hover:bg-primary transition-colors"></div>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
