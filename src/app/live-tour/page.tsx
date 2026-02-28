import type { Metadata } from 'next';
import Link from 'next/link';
import { Video, Calendar, IndianRupee, Rocket, CheckCircle2, Star, Smartphone, Laptop, Globe, Heart, ShieldCheck, ArrowRight, Play, Sparkles, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Live Video Call Experience | ABC Toyz',
    description: 'Experience our premium ride-on toys live from your home. Book a 1-on-1 video call tour for just ₹99, fully refundable on purchase.',
};

export default function LiveTourLandingPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-primary selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-zinc-950">
                {/* Background Decor */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -mr-64 -mt-64" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -ml-64 -mb-64" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Live from our Delhi Showroom
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            See it. <span className="text-primary italic">Live.</span> <br />
                            Before You <span className="underline decoration-primary underline-offset-8">Buy.</span>
                        </h1>

                        <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            Step into our premium showroom from your smartphone. Experience the build quality, hear the motor, and see the details in HD.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <Link
                                href="/category/all"
                                className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                            >
                                Browse Collections <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="w-full sm:w-auto px-10 py-5 bg-zinc-900 border border-white/5 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
                            >
                                How it Works <Play className="w-4 h-4 text-primary fill-primary" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section: Why it matters */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center max-w-6xl mx-auto">
                        <div className="space-y-10 order-2 md:order-1">
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-[1.1]">
                                    Goodbye <span className="text-red-500">Uncertainty.</span> <br />
                                    Hello <span className="text-green-600">Peace of Mind.</span>
                                </h2>
                                <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                                    Online photos can be deceiving. Our live tour gives you the truth. See the real size, the finish of the paint, and the brightness of the LEDs before we ship it to you.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {[
                                    { icon: Sparkles, title: 'Premium HD Feed', desc: 'Crystal clear video so you can see every stitch on the leather seats.' },
                                    { icon: IndianRupee, title: 'Fully Refundable', desc: 'The ₹99 fee is 100% adjusted into your final bill when you buy.' },
                                    { icon: Globe, title: 'Expert Guidance', desc: 'Our showroom staff will answer all your technical and assembly questions live.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-zinc-900">{item.title}</h4>
                                            <p className="text-sm font-medium text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative order-1 md:order-2">
                            {/* Decorative frame for visual interest */}
                            <div className="aspect-[3/4] rounded-[2.5rem] bg-zinc-100 overflow-hidden border-[12px] border-zinc-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative">
                                <video
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                                >
                                    <source src="https://player.vimeo.com/external/494252666.sd.mp4?s=7b018596f2ef562d96c94625b18bc6d3d4b655f4&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
                                </video>

                                {/* Overlay UI elements to mimic a video call */}
                                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE CALL</span>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center text-white text-xs font-black">A</div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Consultant</p>
                                            <p className="text-[9px] font-bold text-white/60">Rahul S.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Smartphone className="w-3.5 h-3.5 text-white" /></div>
                                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"><MessageCircle className="w-3.5 h-3.5 text-white" /></div>
                                    </div>
                                </div>
                            </div>

                            {/* Floaties */}
                            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-[2rem] shadow-2xl border border-zinc-100 hidden lg:block animate-bounce [animation-duration:5s]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-zinc-900 leading-none">100%</p>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Confidence</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 md:py-32 bg-zinc-50 border-y border-zinc-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-20">
                        <div className="text-center space-y-6">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-tight">
                                3 Simple Steps <br />
                                <span className="text-primary italic">To Your VIP Tour.</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 text-center relative">
                            {/* Step 1 */}
                            <div className="space-y-6 relative group">
                                <div className="w-20 h-20 bg-primary text-white rounded-[2.5rem] flex items-center justify-center text-3xl font-black mx-auto shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                                    1
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase">Pick Your Ride</h3>
                                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">Choose any premium toy priced above ₹4,500 and click 'See it Live'.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="space-y-6 relative group">
                                <div className="w-20 h-20 bg-zinc-950 text-white rounded-[2.5rem] flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    2
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase">Book Your Slot</h3>
                                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">Pay a small ₹99 fee to reserve your private 15-minute 1-on-1 consultation.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="space-y-6 relative group">
                                <div className="w-20 h-20 bg-primary text-white rounded-[2.5rem] flex items-center justify-center text-3xl font-black mx-auto shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                                    3
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase">Ready, Set, Live!</h3>
                                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">Join the private Google Meet link. Love it? We'll deduct the ₹99 from your order.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ/Policy Section */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 uppercase">Frequently Asked</h2>
                            <p className="text-zinc-500 font-medium">Clear answers for a smooth experience.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            {[
                                { q: "Is the ₹99 refundable?", a: "Yes! If you buy the toy, we deduct ₹99 from your bill. If you cancel at least 2 hours early, we refund it." },
                                { q: "How long is the call?", a: "Each private session is 15 minutes. This is enough time to see features and ask questions." },
                                { q: "Do I need any special app?", a: "No. We use Google Meet. It works directly in your phone browser or the Meet app." },
                                { q: "Can I bring my kid on call?", a: "Absolutely! We love seeing the kids choose their favorite colors live on video." }
                            ].map((item, i) => (
                                <div key={i} className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 space-y-3 hover:bg-white hover:border-primary/20 transition-all cursor-default group">
                                    <h4 className="font-black text-zinc-900 group-hover:text-primary transition-colors">{item.q}</h4>
                                    <p className="text-sm font-medium text-zinc-500 leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Link
                                href="/booking-policy"
                                className="text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
                            >
                                Read Full Booking Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="pb-24 pt-0">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto rounded-[3rem] bg-zinc-950 p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-none">
                                Ready to <br />
                                <span className="text-primary italic">Meet Your Ride?</span>
                            </h2>
                            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-xl mx-auto">
                                Choose from 50+ premium models and book your live tour today.
                            </p>

                            <div className="pt-8 flex flex-col items-center gap-6">
                                <Link
                                    href="/category/all"
                                    className="w-full sm:w-auto px-12 py-6 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-3xl hover:bg-orange-600 transition-all shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Start Browsing <ArrowRight className="w-5 h-5" />
                                </Link>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Secure Payment</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-primary fill-primary" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">4.9/5 Service</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
