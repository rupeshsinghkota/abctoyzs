"use client";

import { useEffect, useState } from 'react';
import { SettingsService, SEOConfig } from '@/lib/services/settings';
import { VEHICLE_CATEGORIES, AGE_CATEGORIES, POWER_CATEGORIES } from '@/lib/data';
import {
    Globe,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Info,
    Layout as LayoutIcon,
    Layers,
    User,
    Zap,
    Home,
    Sparkles
} from 'lucide-react';

type Tab = 'global' | 'home' | 'categories' | 'age' | 'power';

export default function SEOAdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>('global');
    const [config, setConfig] = useState<SEOConfig | null>(null);
    const [segmentConfig, setSegmentConfig] = useState<Record<string, Partial<SEOConfig>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [global, ...segments] = await Promise.all([
                SettingsService.getSEOConfig(),
                // Homepage
                SettingsService.getSegmentSEO('homepage'),
                // Categories
                ...VEHICLE_CATEGORIES.map(c => SettingsService.getSegmentSEO(`cat_${c.value}`)),
                // Age Groups
                ...AGE_CATEGORIES.map(c => SettingsService.getSegmentSEO(`age_${c.value}`)),
                // Power
                ...POWER_CATEGORIES.map(c => SettingsService.getSegmentSEO(`power_${c.value}`))
            ]);

            setConfig(global);

            const segmentMap: Record<string, Partial<SEOConfig>> = {};
            segmentMap['homepage'] = segments[0];

            let offset = 1;
            VEHICLE_CATEGORIES.forEach((c, i) => {
                segmentMap[`cat_${c.value}`] = segments[offset + i];
            });
            offset += VEHICLE_CATEGORIES.length;

            AGE_CATEGORIES.forEach((c, i) => {
                segmentMap[`age_${c.value}`] = segments[offset + i];
            });
            offset += AGE_CATEGORIES.length;

            POWER_CATEGORIES.forEach((c, i) => {
                segmentMap[`power_${c.value}`] = segments[offset + i];
            });

            setSegmentConfig(segmentMap);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to load SEO configuration.' });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!config) return;

        setSaving(true);
        setStatus(null);

        try {
            if (activeTab === 'global') {
                await SettingsService.updateSEOConfig(config);
            } else {
                // Save all segments for current tab's scope or just the active one?
                // For simplicity, we save all changed segments.
                const savePromises = Object.entries(segmentConfig).map(([key, cfg]) =>
                    SettingsService.updateSegmentSEO(key, cfg)
                );
                await Promise.all(savePromises);
            }
            setStatus({ type: 'success', message: 'SEO settings updated successfully!' });
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    }

    const updateSegment = (key: string, updates: Partial<SEOConfig>) => {
        setSegmentConfig(prev => ({
            ...prev,
            [key]: { ...prev[key], ...updates }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!config) return null;

    const navTabs = [
        { id: 'global', label: 'Global Defaults', icon: Globe },
        { id: 'home', label: 'Homepage', icon: Home },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'age', label: 'Age Groups', icon: User },
        { id: 'power', label: 'Power Levels', icon: Zap },
    ];

    return (
        <div className="max-w-5xl px-4 md:px-0">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Globe className="w-8 h-8 text-primary" />
                    Better SEO Control
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage granular SEO for every segment of your website.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 bg-muted/50 p-1.5 rounded-2xl border w-fit">
                {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {activeTab === 'global' && (
                    <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Global Meta Tags</h2>
                            <p className="text-sm text-muted-foreground">Default values used when no specific segment SEO is defined.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Default Page Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-2xl border-2 focus:border-primary outline-none transition-all"
                                    value={config.defaultTitle}
                                    onChange={(e) => setConfig({ ...config, defaultTitle: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Title Template</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-2xl border-2 focus:border-primary outline-none transition-all"
                                    value={config.titleTemplate}
                                    onChange={(e) => setConfig({ ...config, titleTemplate: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground">Use <code>%s</code> for the page specific title.</p>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Global Description</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-2xl border-2 focus:border-primary outline-none transition-all resize-none"
                                    rows={3}
                                    value={config.defaultDescription}
                                    onChange={(e) => setConfig({ ...config, defaultDescription: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Global Keywords</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-2xl border-2 focus:border-primary outline-none transition-all"
                                    value={config.defaultKeywords.join(', ')}
                                    onChange={(e) => setConfig({ ...config, defaultKeywords: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Default OG Image URL</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-2xl border-2 focus:border-primary outline-none transition-all"
                                    value={config.ogImage}
                                    onChange={(e) => setConfig({ ...config, ogImage: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Twitter Handle</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-2xl border-2 focus:border-primary outline-none transition-all"
                                    value={config.twitterHandle}
                                    onChange={(e) => setConfig({ ...config, twitterHandle: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'home' && (
                    <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Homepage SEO</h2>
                            <p className="text-sm text-muted-foreground">Specific metadata for your main landing page.</p>
                        </div>

                        <div className="space-y-6">
                            <SEOFields
                                segment="homepage"
                                config={segmentConfig['homepage'] || {}}
                                onChange={(updates) => updateSegment('homepage', updates)}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        {VEHICLE_CATEGORIES.map(cat => (
                            <div key={cat.value} className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                        {cat.label[0]}
                                    </span>
                                    {cat.label} Page SEO
                                </h3>
                                <SEOFields
                                    segment={`cat_${cat.value}`}
                                    config={segmentConfig[`cat_${cat.value}`] || {}}
                                    onChange={(updates) => updateSegment(`cat_${cat.value}`, updates)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'age' && (
                    <div className="space-y-6">
                        {AGE_CATEGORIES.map(cat => (
                            <div key={cat.value} className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
                                <h3 className="text-lg font-bold mb-6">Age Group: {cat.label} SEO</h3>
                                <SEOFields
                                    segment={`age_${cat.value}`}
                                    config={segmentConfig[`age_${cat.value}`] || {}}
                                    onChange={(updates) => updateSegment(`age_${cat.value}`, updates)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'power' && (
                    <div className="space-y-6">
                        {POWER_CATEGORIES.map(cat => (
                            <div key={cat.value} className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
                                <h3 className="text-lg font-bold mb-6">Power: {cat.label} SEO</h3>
                                <SEOFields
                                    segment={`power_${cat.value}`}
                                    config={segmentConfig[`power_${cat.value}`] || {}}
                                    onChange={(updates) => updateSegment(`power_${cat.value}`, updates)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-2xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Saving...' : 'Save All SEO Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function SEOFields({
    segment,
    config,
    onChange
}: {
    segment: string,
    config: Partial<SEOConfig>,
    onChange: (updates: Partial<SEOConfig>) => void
}) {
    const [generating, setGenerating] = useState(false);

    const suggestWithAI = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/admin/ai/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ segment })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            onChange({ defaultTitle: data.title, defaultDescription: data.description });
        } catch (error) {
            console.error("AI SEO suggest error:", error);
            alert("Failed to generate AI suggestions. Check your API key.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={suggestWithAI}
                    disabled={generating}
                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-all disabled:opacity-50"
                >
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {generating ? 'Generating...' : 'Suggest Optimized SEO with AI'}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Title Override</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border border-dashed hover:border-muted-foreground outline-none transition-all focus:border-primary focus:border-solid bg-muted/20"
                        value={config.defaultTitle || ''}
                        onChange={(e) => onChange({ defaultTitle: e.target.value })}
                        placeholder="Leave empty for auto-generated title"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Description Override</label>
                    <textarea
                        className="w-full px-4 py-2.5 rounded-xl border border-dashed hover:border-muted-foreground outline-none transition-all focus:border-primary focus:border-solid bg-muted/20 resize-none"
                        rows={1}
                        value={config.defaultDescription || ''}
                        onChange={(e) => onChange({ defaultDescription: e.target.value })}
                        placeholder="Leave empty for standard description"
                    />
                </div>
            </div>
        </div>
    );
}
