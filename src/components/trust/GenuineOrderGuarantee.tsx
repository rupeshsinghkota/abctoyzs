"use client";

import { CheckCircle2, Video, PhoneCall, ShieldCheck, Zap } from "lucide-react";
import { useCodSettings } from "@/hooks/useCodSettings";

export function GenuineOrderGuarantee({ className = "" }: { className?: string }) {
    const { advance, type } = useCodSettings();
    const displayAdvance = type === 'percentage' ? `${advance}%` : `₹${advance}`;

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-indigo-600 rounded-lg">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">Genuine Order Exclusive</h4>
                    </div>

                    <p className="text-[11px] font-bold text-indigo-800 leading-relaxed mb-4">
                        We prioritize serious buyers to ensure the fastest delivery for your little one.
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-1 bg-white rounded-md border border-indigo-100 shadow-sm mt-0.5">
                                <PhoneCall className="w-3 h-3 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-950 leading-tight">Post-Order Verification</p>
                                <p className="text-[9px] text-indigo-600/70 font-medium">Our agent will call you within 1-2 hours to confirm details.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-1 bg-white rounded-md border border-indigo-100 shadow-sm mt-0.5">
                                <Video className="w-3 h-3 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-950 leading-tight">VIP Product Preview</p>
                                <p className="text-[9px] text-indigo-600/70 font-medium font-bold">Paid bookings can request live photos/videos of their specific unit.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-1 bg-white rounded-md border border-indigo-100 shadow-sm mt-0.5">
                                <Zap className="w-3 h-3 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-950 leading-tight">Genuine Only Service</p>
                                <p className="text-[9px] text-red-500 font-bold">To maintain quality, only confirmed orders with {displayAdvance} advance will be entertained for unit-specific details.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
