"use client";

import { useEffect, useState } from 'react';
import { User, Loader2, Save, ArrowLeft } from 'lucide-react';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountDetailsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setEmail(user.email || '');
            setUserId(user.id);
        }
        setLoading(false);
    }

    // Currently Supabase Auth handles email/password. 
    // This is a placeholder for future detailed profile (Name, Phone specific to account not address)
    // For now, we just show email as read-only or allow password reset trigger.

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-24">
            {/* App-Style Minimal Header (Hidden on Mobile) */}
            <div className="hidden md:block bg-zinc-900 pt-16 pb-24 -mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Account Details</h1>
                    <p className="text-zinc-400 font-bold mt-2 text-sm md:text-base">Manage your login information</p>
                </div>
            </div>

            {/* Mobile Header: App Bar style */}
            <div className="md:hidden bg-zinc-900 pt-8 pb-12 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                <div className="relative z-10 flex items-center gap-4 pt-4">
                    <Link href="/profile" className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 backdrop-blur-sm">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Account Info</h1>
                        <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Secure Session</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8 relative z-20 -mt-6 md:mt-0">
                <ProfileSidebar />

                <div className="flex-1 max-w-xl">
                    <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-2xl shadow-zinc-200/50">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-zinc-900 tracking-tight">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <User className="w-5 h-5" />
                            </div>
                            Login Information
                        </h2>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-[1.5rem] px-6 py-5 text-base font-black text-zinc-400 cursor-not-allowed outline-none"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <div className="px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Verified</div>
                                    </div>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-bold mt-2 ml-1">To change your email, please contact support.</p>
                            </div>

                            <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button
                                    className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-[1.25rem] font-black text-sm tracking-tight shadow-xl hover:bg-zinc-800 active:scale-[0.98] transition-all"
                                    onClick={() => router.push('/forgot-password')}
                                >
                                    Reset Password
                                </button>

                                <p className="text-xs text-zinc-400 font-medium text-center sm:text-right">
                                    Last checked: {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
