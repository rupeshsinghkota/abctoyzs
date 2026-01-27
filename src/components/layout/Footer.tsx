"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    if (pathname?.startsWith('/admin')) return null;

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const FooterSection = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
        <div className="border-b border-zinc-800 md:border-none last:border-none">
            <button
                onClick={() => toggleSection(id)}
                className="flex items-center justify-between w-full md:cursor-default md:pointer-events-none py-4 md:py-0 group"
            >
                <h3 className="text-white font-bold text-base md:text-lg tracking-tight">{title}</h3>
                <ChevronDown
                    className={cn(
                        "w-5 h-5 text-zinc-500 transition-transform duration-300 md:hidden",
                        openSections[id] ? "rotate-180" : "rotate-0"
                    )}
                />
            </button>
            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out md:h-auto md:opacity-100",
                openSections[id] ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0 md:max-h-none md:pb-0 md:mt-6"
            )}>
                {children}
            </div>
        </div>
    );

    return (
        <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-12 border-t border-zinc-900">
            <div className="container max-w-7xl mx-auto px-6 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <img
                                src="/logo_wide.png"
                                alt="ABC TOYZ"
                                className="h-8 md:h-10 w-auto object-contain brightness-0 invert opacity-100"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed text-zinc-400">
                            The ultimate destination for premium ride-on cars, bikes, and adventurers for the next generation. Safety certified and built for fun.
                        </p>

                        {/* Newsletter Mini */}
                        <div className="pt-2">
                            <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Stay Updated</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary/50 transition-colors"
                                />
                                <button className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <SocialLink icon={<Instagram className="w-5 h-5" />} href="#" label="Instagram" />
                            <SocialLink icon={<Facebook className="w-5 h-5" />} href="#" label="Facebook" />
                            <SocialLink icon={<Youtube className="w-5 h-5" />} href="#" label="Youtube" />
                            <SocialLink icon={<Twitter className="w-5 h-5" />} href="#" label="Twitter" />
                        </div>
                    </div>

                    {/* Shop Column */}
                    <FooterSection title="Shop Categories" id="shop">
                        <ul className="space-y-3">
                            <li><FooterLink href="/category/cars">Electric Cars</FooterLink></li>
                            <li><FooterLink href="/category/bikes">Motorcycles</FooterLink></li>
                            <li><FooterLink href="/category/jeeps">Jeeps & SUVs</FooterLink></li>
                            <li><FooterLink href="/category/atvs">ATVs & Buggies</FooterLink></li>
                            <li><FooterLink href="/category/scooters">Electric Scooters</FooterLink></li>
                            <li><FooterLink href="/category/parts">Spare Parts & Batteries</FooterLink></li>
                        </ul>
                    </FooterSection>

                    {/* Support Column */}
                    <FooterSection title="Customer Support" id="support">
                        <ul className="space-y-3">
                            <li><FooterLink href="#">Track My Order</FooterLink></li>
                            <li><FooterLink href="#">Shipping & Delivery</FooterLink></li>
                            <li><FooterLink href="#">Returns & Refunds</FooterLink></li>
                            <li><FooterLink href="#">Warranty Policy</FooterLink></li>
                            <li><FooterLink href="#">Assembly Guides</FooterLink></li>
                            <li><FooterLink href="#">Contact Us</FooterLink></li>
                        </ul>
                    </FooterSection>

                    {/* Contact Column */}
                    <FooterSection title="Get in Touch" id="contact">
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Headquarters</p>
                                    <p className="text-sm mt-1">123 Toy Street, Kids Valley,<br />Mumbai, MH 400001</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-primary">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Phone Support</p>
                                    <p className="text-sm mt-1">+91 98765 43210</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Mon-Sat, 9am - 7pm</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-primary">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Email Us</p>
                                    <p className="text-sm mt-1">support@abctoyz.com</p>
                                </div>
                            </li>
                        </ul>
                    </FooterSection>
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
                    <p>&copy; {new Date().getFullYear()} ABC Toyz. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
    return (
        <Link
            href={href}
            className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm"
            aria-label={label}
        >
            {icon}
        </Link>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="block text-zinc-400 hover:text-white hover:pl-1 transition-all duration-200 text-sm"
        >
            {children}
        </Link>
    );
}
