"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsAdmin(false);
                    return;
                }

                // Check admins table
                const { data } = await supabase
                    .from('admins')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .single();

                setIsAdmin(!!data);
            } catch (error) {
                console.error("Admin check failed", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, []);

    return { isAdmin, loading };
}
