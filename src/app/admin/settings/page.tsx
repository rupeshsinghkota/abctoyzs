"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, CreditCard, DollarSign, Ban } from 'lucide-react';

interface Settings {
    id: string;
    cod_mode: 'normal' | 'partial';
    cod_advance_type: 'percentage' | 'fixed';
    cod_advance_value: number;
    ai_reply_enabled: boolean;
    global_daily_discount: number;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        id: '',
        cod_mode: 'normal',
        cod_advance_type: 'percentage',
        cod_advance_value: 0,
        ai_reply_enabled: true,
        global_daily_discount: 0
    });

    const supabase = createClient();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // First try to get existing settings
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No settings found, create default
                    const { data: newData, error: createError } = await supabase
                        .from('settings')
                        .insert([{
                            cod_mode: 'normal',
                            cod_advance_type: 'percentage',
                            cod_advance_value: 0,
                            ai_reply_enabled: true,
                            global_daily_discount: 0
                        }])
                        .select()
                        .single();

                    if (createError) throw createError;
                    if (newData) setSettings(newData);
                } else {
                    throw error;
                }
            } else if (data) {
                setSettings({
                    id: data.id,
                    cod_mode: data.cod_mode || 'normal',
                    cod_advance_type: data.cod_advance_type || 'percentage',
                    cod_advance_value: data.cod_advance_value || 0,
                    ai_reply_enabled: data.ai_reply_enabled !== false, // Default to true if null
                    global_daily_discount: data.global_daily_discount || 0
                });
            }
        } catch (error: any) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('settings')
                .update({
                    cod_mode: settings.cod_mode,
                    cod_advance_type: settings.cod_advance_type,
                    cod_advance_value: settings.cod_advance_value,
                    ai_reply_enabled: settings.ai_reply_enabled,
                    global_daily_discount: settings.global_daily_discount
                })
                .eq('id', settings.id);

            if (error) throw error;
            toast.success('Settings saved successfully');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
                    <p className="text-gray-500 mt-1">Manage payment and checkout configurations</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="space-y-6">
                {/* 1. COD Configuration Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">COD Configuration</h2>
                            <p className="text-sm text-gray-500 mt-1">Configure how Cash on Delivery works for your customers.</p>
                        </div>
                    </div>

                    <div className="space-y-6 pl-0 md:pl-14">
                        {/* Mode Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setSettings({ ...settings, cod_mode: 'normal' })}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${settings.cod_mode === 'normal'
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.cod_mode === 'normal' ? 'border-black' : 'border-gray-300'}`}>
                                        {settings.cod_mode === 'normal' && <div className="w-2 h-2 rounded-full bg-black" />}
                                    </div>
                                    <span className="font-bold text-gray-900">Normal COD</span>
                                </div>
                                <p className="text-xs text-gray-500 pl-7">Customer pays nothing now. Full amount is collected on delivery.</p>
                            </button>

                            <button
                                onClick={() => setSettings({ ...settings, cod_mode: 'partial' })}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${settings.cod_mode === 'partial'
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.cod_mode === 'partial' ? 'border-black' : 'border-gray-300'}`}>
                                        {settings.cod_mode === 'partial' && <div className="w-2 h-2 rounded-full bg-black" />}
                                    </div>
                                    <span className="font-bold text-gray-900">Partial COD (Advance)</span>
                                </div>
                                <p className="text-xs text-gray-500 pl-7">Customer pays a small advance online. Balance is collected on delivery.</p>
                            </button>
                        </div>

                        {/* Partial COD Options (Conditional) */}
                        {settings.cod_mode === 'partial' && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Advance Payment Rules</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Advance Type</label>
                                        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                            <button
                                                onClick={() => setSettings({ ...settings, cod_advance_type: 'percentage' })}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${settings.cod_advance_type === 'percentage'
                                                    ? 'bg-black text-white shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                            >
                                                Percentage (%)
                                            </button>
                                            <button
                                                onClick={() => setSettings({ ...settings, cod_advance_type: 'fixed' })}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${settings.cod_advance_type === 'fixed'
                                                    ? 'bg-black text-white shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                            >
                                                Fixed Amount (₹)
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                                            {settings.cod_advance_type === 'percentage' ? 'Percentage Value' : 'Amount Value'}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                {settings.cod_advance_type === 'percentage' ? (
                                                    <span className="text-gray-400 font-bold">%</span>
                                                ) : (
                                                    <span className="text-gray-400 font-bold">₹</span>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max={settings.cod_advance_type === 'percentage' ? 100 : 100000}
                                                value={settings.cod_advance_value}
                                                onChange={(e) => setSettings({ ...settings, cod_advance_value: Number(e.target.value) })}
                                                className="block w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-black focus:border-black sm:text-sm font-medium transition-all"
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {settings.cod_advance_type === 'percentage'
                                                ? 'Example: Enter 10 for 10% advance.'
                                                : 'Example: Enter 500 to force ₹500 advance.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing & Promotions Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Pricing & Promotions</h2>
                            <p className="text-sm text-gray-500 mt-1">Manage global discounts and store-wide sales.</p>
                        </div>
                    </div>

                    <div className="space-y-6 pl-0 md:pl-14">
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-900 tracking-wider">Global Daily Discount</h3>
                                {settings.global_daily_discount > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                        SALE ACTIVE ({settings.global_daily_discount}%)
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                Enter a percentage value (0-100) to globally discount all products. This will automatically update prices on the website, cart, XML feeds, and AI responses.
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Discount Percentage</label>
                                <div className="relative max-w-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold">%</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={settings.global_daily_discount}
                                        onChange={(e) => setSettings({ ...settings, global_daily_discount: Math.max(0, Math.min(100, Number(e.target.value))) })}
                                        className="block w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-black focus:border-black sm:text-sm font-medium transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. AI Configuration Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-xl font-bold text-purple-600">AI</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">AI Configuration</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage AI-powered customer interactions.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.ai_reply_enabled}
                                        onChange={(e) => setSettings({ ...settings, ai_reply_enabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pl-0 md:pl-14">
                        <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                            <h3 className="text-sm font-bold text-purple-900 mb-1">WhatsApp AI Replies</h3>
                            <p className="text-sm text-purple-800/80">
                                When enabled, the AI will automatically respond to customer inquiries on WhatsApp using order context and store information.
                            </p>
                            {!settings.ai_reply_enabled && (
                                <div className="mt-3 flex items-center gap-2 text-amber-600 font-medium text-sm">
                                    <Ban className="w-4 h-4" />
                                    AI replies are currently disabled
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Future Settings Placeholders */}
                {/* Add more cards here for Shipping, SEO, etc. */}
            </div>
        </div>
    );
}
