import { createClient } from '@/lib/supabase/client';

export interface SEOConfig {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultKeywords: string[];
    ogImage: string;
    twitterHandle: string;
}

const DEFAULT_SEO: SEOConfig = {
    defaultTitle: "abctoyz - Premium Ride-on Toys for Kids in India",
    titleTemplate: "%s | abctoyz",
    defaultDescription: "Explore the best premium ride-on cars, bikes, and jeeps for kids in India. Quality guaranteed with 24-48 hour dispatch.",
    defaultKeywords: ["ride-on toys", "kids electric cars", "toy bikes", "ride-on jeeps", "battery operated cars"],
    ogImage: "/og-image.png",
    twitterHandle: "@abctoyz"
};

export const SettingsService = {
    async getSEOConfig(supabaseClient?: any): Promise<SEOConfig> {
        try {
            const supabase = supabaseClient || createClient();
            const { data, error } = await supabase
                .from('site_configs')
                .select('value')
                .eq('key', 'seo')
                .single();

            if (error || !data) {
                // Only log warning if it's not a "table not found" error or something expected
                if (error && error.code !== 'PGRST116') {
                    console.warn("[SettingsService] Using default SEO config:", error.message);
                }
                return DEFAULT_SEO;
            }

            return { ...DEFAULT_SEO, ...(data.value as SEOConfig) };
        } catch (e) {
            console.error("[SettingsService] Error fetching SEO config:", e);
            return DEFAULT_SEO;
        }
    },

    async updateSEOConfig(config: SEOConfig): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('site_configs')
            .upsert({
                key: 'seo',
                value: config,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    },

    async getSegmentSEO(segmentKey: string, supabaseClient?: any): Promise<Partial<SEOConfig>> {
        try {
            const supabase = supabaseClient || createClient();
            const { data, error } = await supabase
                .from('site_configs')
                .select('value')
                .eq('key', `seo_segment_${segmentKey}`)
                .single();

            if (error || !data) {
                return {};
            }

            return data.value;
        } catch (e) {
            console.error(`[SettingsService] Error fetching SEO config for ${segmentKey}:`, e);
            return {};
        }
    },

    async updateSegmentSEO(segmentKey: string, config: Partial<SEOConfig>): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('site_configs')
            .upsert({
                key: `seo_segment_${segmentKey}`,
                value: config,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    },

    async getSettings(supabaseClient?: any): Promise<any> {
        try {
            const supabase = supabaseClient || createClient();
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .single();

            if (error || !data) {
                return null;
            }

            return data;
        } catch (e) {
            console.error("[SettingsService] Error fetching settings:", e);
            return null;
        }
    }
};
