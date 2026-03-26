"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, ChevronDown, ArrowRight, Shield, Truck, CheckCircle2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewsletterService } from "@/lib/services/newsletter";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ support: true });
    const [email, setEmail] = useState("");
    const [subscribing, setSubscribing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) return null;

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribing(true);
        setStatus(null);

        const result = await NewsletterService.subscribe(email);

        if (result.success) {
            setEmail("");
            setStatus({ type: 'success', message: result.message });
            setTimeout(() => setStatus(null), 5000);
        } else {
            setStatus({ type: 'error', message: result.message });
        }
        setSubscribing(false);
    };

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
                <h3 className="text-white font-black text-[11px] uppercase tracking-[0.2em]">{title}</h3>
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
                                src="/logo_wide.webp"
                                alt="ABC Toyz"
                                className="h-8 md:h-10 w-auto object-contain brightness-0 invert opacity-100"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed text-zinc-400">
                            The ultimate destination for premium ride-on cars, bikes, and adventurers for the next generation. Safety certified and built for fun.
                        </p>

                        {/* Newsletter Mini */}
                        <div className="pt-2">
                            <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Stay Updated</p>
                            <form onSubmit={handleSubscribe} className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        disabled={subscribing}
                                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={subscribing}
                                        className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {subscribing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                    </button>
                                </div>
                                {status && (
                                    <p className={cn(
                                        "text-[10px] font-medium animate-in fade-in slide-in-from-top-1",
                                        status.type === 'success' ? "text-green-500" : "text-red-500"
                                    )}>
                                        {status.message}
                                    </p>
                                )}
                            </form>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <SocialLink icon={<Instagram className="w-5 h-5" />} href="https://www.instagram.com/abctoyz.in/" label="Instagram" />
                            <SocialLink icon={<Facebook className="w-5 h-5" />} href="https://www.facebook.com/abctoyz.in/" label="Facebook" />
                            {/* <SocialLink icon={<Youtube className="w-5 h-5" />} href="#" label="Youtube" /> */}
                            {/* <SocialLink icon={<Twitter className="w-5 h-5" />} href="#" label="Twitter" /> */}
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

                        </ul>
                    </FooterSection>

                    {/* Support Column */}
                    <FooterSection title="Customer Support" id="support">
                        <ul className="space-y-3">
                            <li><FooterLink href="/track-order">Track My Order</FooterLink></li>
                            <li><FooterLink href="/shipping-policy">Shipping & Delivery</FooterLink></li>
                            <li><FooterLink href="/refund-policy">Returns & Refunds</FooterLink></li>
                            <li><FooterLink href="/about-us">About Us</FooterLink></li>
                            <li><FooterLink href="/contact-us">Contact Us</FooterLink></li>
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
                                    <p className="text-sm mt-1">Shop No 123A, Jhandewalan Toy Market,<br />Near Videocon Tower, New Delhi - 110055</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-primary">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Phone Support</p>
                                    <p className="text-sm mt-1">+91 82392 69217</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Mon-Sat, 9am - 7pm</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-primary">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Email Us</p>
                                    <p className="text-sm mt-1">support@abctoyz.in</p>
                                </div>
                            </li>
                        </ul>
                    </FooterSection>
                </div>

                {/* Trust Indicators Ribbon */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-zinc-900 mb-8">
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-primary shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xs uppercase tracking-wider">Secure Payment</p>
                            <p className="text-[10px] text-zinc-500">100% Safe Checkout</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-primary shrink-0">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xs uppercase tracking-wider">Fast Shipping</p>
                            <p className="text-[10px] text-zinc-500">24-48 Hour Dispatch</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-primary shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xs uppercase tracking-wider">Quality Checked</p>
                            <p className="text-[10px] text-zinc-500">Safety Certified</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-primary shrink-0">
                            <RefreshCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xs uppercase tracking-wider">10-Day Replacement</p>
                            <p className="text-[10px] text-zinc-500">For Defects/Damage</p>
                        </div>
                    </div>
                </div>

                {/* Partner Badges */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700 mb-12 bg-zinc-900/30 p-8 rounded-3xl border border-white/5">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Our Logistics Partners</span>
                        <div className="flex gap-8 items-center">
                            <span className="text-white font-black text-xs tracking-tighter opacity-80 uppercase">Bluedart</span>
                            <span className="text-white font-black text-xs tracking-tighter opacity-80 uppercase">Delhivery</span>
                            <span className="text-white font-black text-xs tracking-tighter opacity-80 uppercase">Xpressbees</span>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-zinc-800 hidden md:block" />
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Secure Payments by</span>
                        <span className="text-[#3395FF] font-black text-sm tracking-tighter italic opacity-80 uppercase">Razorpay</span>
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
                    <p>&copy; {new Date().getFullYear()} ABC Toyz. All rights reserved.</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link>
                        <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
                        <Link href="/billing-terms-and-conditions" className="hover:text-white transition-colors">Billing Terms</Link>
                        <Link href="/payment-policy" className="hover:text-white transition-colors font-bold text-zinc-300">Payment Policy</Link>
                        <Link href="/site-map" className="hover:text-white transition-colors">Sitemap</Link>
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
