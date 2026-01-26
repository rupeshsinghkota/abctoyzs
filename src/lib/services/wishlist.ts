import { createClient } from '@/lib/supabase/client';

export type WishlistItem = {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
};

export const WishlistService = {
    async getWishlist() {
        const supabase = createClient();
        const { data } = await supabase
            .from('wishlist')
            .select('product_id')
            .order('created_at', { ascending: false });

        return (data || []).map((item: any) => item.product_id);
    },

    async isInWishlist(productId: string): Promise<boolean> {
        const supabase = createClient();
        const { data } = await supabase
            .from('wishlist')
            .select('id')
            .eq('product_id', productId)
            .single();

        return !!data;
    },

    async addToWishlist(productId: string) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('wishlist')
            .insert({ user_id: user.id, product_id: productId });

        if (error && error.code !== '23505') throw error; // Ignore duplicate key error
    },

    async removeFromWishlist(productId: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('product_id', productId);

        if (error) throw error;
    },

    async toggleWishlist(productId: string): Promise<boolean> {
        const isWishlisted = await this.isInWishlist(productId);
        if (isWishlisted) {
            await this.removeFromWishlist(productId);
            return false;
        } else {
            await this.addToWishlist(productId);
            return true;
        }
    }
};
