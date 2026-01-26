import React from 'react';
import { Mail, ArrowRight, Star } from 'lucide-react';

export function Newsletter() {
    return (
        <div className="py-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-4">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-black rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden border border-white/10 shadow-2xl">
                    {/* Floating Icons */}
                    <div className="absolute top-10 left-10 text-primary/20 animate-bounce delay-100">
                        <Star className="w-12 h-12" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-10 right-10 text-primary/20 animate-bounce delay-700">
                        <Star className="w-8 h-8" fill="currentColor" />
                    </div>

                    <div className="max-w-2xl mx-auto relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-600 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/30">
                            <Mail className="w-10 h-10 text-white -rotate-12" />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black font-heading mb-4 text-white tracking-tight">
                            Stay in the Loop
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                            Join the <span className="text-primary font-bold">Little Legends Club</span>. Get exclusive access to new drops, VIP sales, and styling tips.
                        </p>

                        <div className="relative max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full pl-6 pr-36 py-5 rounded-full border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm transition-all shadow-inner"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-8 bg-primary hover:bg-orange-600 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary/25">
                                Subscribe
                            </button>
                        </div>
                        <p className="text-xs text-white/20 mt-6">
                            No spam, just toys. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
