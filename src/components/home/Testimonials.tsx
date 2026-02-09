'use client';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const reviews = [
    { name: "Priya Sharma", text: "My son absolutely loves his new Thar jeep! The battery life is amazing and it handles rough terrain easily. Best birthday gift ever!", rating: 5, location: "Mumbai" },
    { name: "Rahul Mehta", text: "I was worried about the assembly, but the support team video call helped me set it up in 10 minutes. excellent service!", rating: 5, location: "Delhi" },
    { name: "Anita Krishnan", text: "Premium quality. Unlike the cheap plastic ones I've seen elsewhere. These feel sturdy and safe. Highly detailed.", rating: 5, location: "Bangalore" },
];

export function Testimonials() {
    return (
        <section className="py-16 md:py-24 bg-zinc-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute -left-20 top-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border rounded-full text-xs font-bold uppercase tracking-wider text-primary mb-4 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Trusted by 15,000+ Families</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-4 tracking-tight">Happy Parents, <span className="text-primary">Happy Kids</span></h2>
                    <p className="text-zinc-500 max-w-xl mx-auto text-lg">Join thousands of satisfied families across India who chose ABC Toyz for their little one's first ride.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {reviews.map((r, i) => (
                        <div key={i} className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 relative group hover:-translate-y-2 transition-transform duration-300">
                            <Quote className="absolute top-8 right-8 w-12 h-12 text-zinc-50 fill-zinc-100 group-hover:text-primary/10 group-hover:fill-primary/10 transition-colors" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(r.rating)].map((_, j) => (
                                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                                ))}
                            </div>

                            <p className="text-zinc-600 mb-8 leading-relaxed font-medium text-lg">"{r.text}"</p>

                            <div className="flex items-center gap-4 border-t border-zinc-50 pt-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center font-bold text-zinc-400 text-sm">
                                    {r.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900">{r.name}</h4>
                                    <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Verified Buyer • {r.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
