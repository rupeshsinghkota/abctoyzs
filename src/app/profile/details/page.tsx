"use client";

import { useEffect, useState } from 'react';
import { User, Loader2, Save } from 'lucide-react';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
        <div className="min-h-screen bg-background pb-24">
            <div className="bg-primary/5 py-12 mb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold font-heading">Account Details</h1>
                    <p className="text-muted-foreground mt-2">Manage your login information.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
                <ProfileSidebar />

                <div className="flex-1 max-w-xl">
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Login Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full px-4 py-2 bg-muted border rounded-lg text-muted-foreground cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground mt-1">To change your email, please contact support.</p>
                            </div>

                            {/* Password Reset Trigger (Could be added here) */}
                            <div className="pt-4 border-t">
                                <button
                                    className="text-sm font-bold text-primary hover:underline"
                                    onClick={() => router.push('/forgot-password')}
                                >
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
