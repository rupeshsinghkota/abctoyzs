"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BRAND_CONFIG } from '@/config/brand';

export interface CodSettings {
    advance: number;
    type: 'fixed' | 'percentage';
    loading: boolean;
}

export function useCodSettings() {
    const [settings, setSettings] = useState<CodSettings>({
        advance: BRAND_CONFIG.payment.codAdvanceAmount,
        type: BRAND_CONFIG.payment.codAdvanceType as 'fixed' | 'percentage',
        loading: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('settings')
                    .select('cod_advance_value, cod_advance_type, cod_mode')
                    .single();

                if (data && !error) {
                    setSettings({
                        advance: data.cod_advance_value || BRAND_CONFIG.payment.codAdvanceAmount,
                        type: (data.cod_advance_type || BRAND_CONFIG.payment.codAdvanceType) as 'fixed' | 'percentage',
                        loading: false
                    });
                } else {
                    setSettings(prev => ({ ...prev, loading: false }));
                }
            } catch (err) {
                console.error('Error fetching COD settings:', err);
                setSettings(prev => ({ ...prev, loading: false }));
            }
        };

        fetchSettings();
    }, []);

    return settings;
}
