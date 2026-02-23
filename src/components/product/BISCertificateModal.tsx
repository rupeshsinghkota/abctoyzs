"use client";

import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BISCertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BISCertificateModal({ isOpen, onClose }: BISCertificateModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col">
                {/* Header */}
                <div className="bg-zinc-900 p-4 md:p-6 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 md:p-2 bg-primary rounded-lg md:rounded-xl">
                            <ShieldCheck className="w-4 h-4 md:w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black italic tracking-tight">BIS Safety <span className="text-primary italic">Certified</span></h2>
                            <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-1">Authentic Quality Verification</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 md:w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Certificate Image Area */}
                    <div className="p-4 md:p-8 bg-zinc-50 flex items-center justify-center">
                        <div className="relative group overflow-hidden rounded-xl border-4 md:border-8 border-white shadow-xl rotate-1 max-w-full">
                            <img
                                src="/certificates/bis_safety_cert.png"
                                alt="BIS Safety Certificate"
                                className="w-full h-auto max-h-[40vh] md:max-h-[60vh] object-contain transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                    </div>

                    {/* Trust Points */}
                    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                        <TrustFeature
                            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            title="Tested for Impact"
                            label="ABS shell strength verified for safe play"
                        />
                        <TrustFeature
                            icon={<Award className="w-4 h-4 text-primary" />}
                            title="ISI Mark Quality"
                            label="Compliant with Indian Safety Standards"
                        />
                        <TrustFeature
                            icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
                            title="Non-Toxic Materials"
                            label="Paints and plastics are 100% child-safe"
                        />
                        <TrustFeature
                            icon={<CheckCircle2 className="w-4 h-4 text-primary" />}
                            title="Battery Safety"
                            label="Advanced PCB protection for 12V/24V"
                        />
                    </div>

                    {/* Footer Action */}
                    <div className="px-4 md:px-8 pb-6 md:pb-8">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 md:py-4 bg-zinc-900 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-zinc-200"
                        >
                            Verified & Confirmed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrustFeature({ icon, title, label }: { icon: React.ReactNode; title: string; label: string }) {
    return (
        <div className="flex gap-3 items-start p-3 rounded-2xl hover:bg-zinc-50 transition-colors">
            <div className="mt-1 shrink-0">{icon}</div>
            <div>
                <p className="font-black text-zinc-900 text-sm">{title}</p>
                <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">{label}</p>
            </div>
        </div>
    );
}
