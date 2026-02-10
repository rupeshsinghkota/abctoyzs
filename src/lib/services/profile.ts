import { createClient } from '@/lib/supabase/client';

export type Address = {
    id: string;
    user_id: string;
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
    email?: string; // Optional email for guests/notifications
    created_at: string;
};

export type Profile = {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
};

export const ProfileService = {
    async getProfile() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return data as Profile;
    },

    async updateProfile(updates: Partial<Profile>) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) throw error;
    },

    async getAddresses() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        return (data || []) as Address[];
    },

    async addAddress(address: Omit<Address, 'id' | 'user_id' | 'created_at'>) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // If this is set to default and user is logged in, unset others
        if (address.is_default && user) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        // We aren't saving 'email' to address table yet unless column exists.
        // But for the frontend state to work, we return it.
        // Let's assume we pass it through.
        const { email, ...dbAddress } = address;

        const { data, error } = await supabase
            .from('addresses')
            .insert({ ...dbAddress, user_id: user?.id || null })
            .select()
            .single();

        if (error) throw error;
        // Return with email so frontend can use it immediately for the order call
        return { ...data, email } as Address;
    },

    async deleteAddress(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async upsertProfile(profile: Partial<Profile> & { email?: string, is_guest?: boolean }) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('profiles')
            .upsert(profile, { onConflict: 'id' })
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    }
};
