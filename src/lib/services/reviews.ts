import { createClient } from '@/lib/supabase/client';

export interface Review {
    id: string;
    product_id: string;
    customer_name: string;
    rating: number;
    comment: string;
    images: string[];
    location?: string;
    is_verified: boolean;
    is_approved: boolean;
    helpful_count: number;
    created_at: string;
}

export const ReviewService = {
    async getProductReviews(productId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('product_reviews')
            .select('*')
            .eq('product_id', productId)
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[ReviewService] getProductReviews error:', error);
            return [];
        }

        return data as Review[];
    },

    async submitReview(reviewData: {
        product_id: string;
        customer_name: string;
        rating: number;
        comment: string;
        images?: string[];
        location?: string;
    }) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('product_reviews')
            .insert({
                ...reviewData,
                is_approved: false // Moderation required
            })
            .select()
            .single();

        if (error) throw error;
        return data as Review;
    },

    async toggleHelpful(reviewId: string, currentCount: number) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('product_reviews')
            .update({ helpful_count: currentCount + 1 })
            .eq('id', reviewId)
            .select()
            .single();

        if (error) throw error;
        return data as Review;
    }
};
