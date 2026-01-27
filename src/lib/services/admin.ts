import { createClient } from '@/lib/supabase/client';

export type Product = {
    id: string;
    slug: string;
    name: string;
    description: string;
    base_price: number;
    category: string;
    subcategory?: string;
    images: string[];
    specs: any;
    voltage?: string;
    age_group?: string;
    stock: number;
    rating: number;
    review_count: number;
    is_new: boolean;
    is_featured: boolean;
    // Premium Features
    videos?: string[];
    box_content?: string[];
    product_dimensions?: string;
    box_dimensions?: string;
    net_weight?: string;
    gross_weight?: string;
    // Variations
    attributes?: { name: string; options: string[] }[];
    variants?: any[]; // We'll type this more strictly if needed
    created_at: string;
    updated_at: string;
};

export const AdminService = {
    async isAdmin(): Promise<boolean> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        return !!data;
    },

    // Products
    async getProducts() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    },

    async getProduct(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Product;
    },

    async createProduct(product: Partial<Product>) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();

        if (error) throw error;
        return data as Product;
    },

    async updateProduct(id: string, updates: Partial<Product>) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Product;
    },

    async deleteProduct(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async createVariants(variants: any[]) {
        const supabase = createClient();
        const { error } = await supabase
            .from('product_variants')
            .insert(variants);

        if (error) throw error;
    },

    // Orders (Admin View)
    async getAllOrders() {
        const supabase = createClient();

        // Get all orders with address information
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, shipping_address:addresses(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!orders) return [];

        const orderIds = orders.map(o => o.id);
        const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        return orders.map(order => ({
            ...order,
            items: items?.filter(item => item.order_id === order.id) || []
        }));
    },

    async updateOrderStatus(orderId: string, status: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;
    },

    // Stats
    async getStats() {
        const supabase = createClient();

        const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount');

        const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

        return {
            totalProducts: productCount || 0,
            totalOrders: orderCount || 0,
            totalRevenue
        };
    }
};
