import { createClient } from '@/lib/supabase/client';

export type Product = {
    id: string;
    slug: string;
    name: string;
    description: string;
    base_price: number;
    mrp?: number;
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
    // SEO
    meta_title?: string;
    meta_description?: string;
    // Premium Features
    videos?: string[];
    box_content?: string[];
    product_dimensions?: string;
    box_dimensions?: string;
    net_weight?: string;
    gross_weight?: string;
    marketing_suite?: {
        action: string;
        comfort: string;
        durability: string;
    };
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

    async uploadFile(file: File, path: string): Promise<string> {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        return publicUrl;
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

    async getProductWithVariants(id: string) {
        const supabase = createClient();

        // 1. Get Product
        const { data: product, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (prodError) throw prodError;

        // 2. Get Variants
        const { data: variants, error: varError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', id);

        if (varError) throw varError;

        return { ...product, variants: variants || [] };
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

    async replaceVariants(productId: string, variants: any[]) {
        const supabase = createClient();

        // 1. Delete existing variants
        const { error: deleteError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', productId);

        if (deleteError) throw deleteError;

        // 2. Insert new ones
        if (variants.length > 0) {
            const { error: insertError } = await supabase
                .from('product_variants')
                .insert(variants);

            if (insertError) throw insertError;
        }
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
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (error) throw error;
    },

    async updateOrder(orderId: string, updates: any) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('orders')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getCustomers() {
        // Derived from orders since we don't have a synced public profiles table yet
        const orders = await this.getAllOrders();
        const customerMap = new Map();

        for (const order of orders) {
            // Identifier: User ID or Name+Phone
            const id = order.user_id || `${order.shipping_address?.name}-${order.shipping_address?.phone}`;

            if (!customerMap.has(id)) {
                customerMap.set(id, {
                    id,
                    name: order.shipping_address?.name || 'Guest',
                    email: '—', // We don't have email in orders table directly usually
                    phone: order.shipping_address?.phone || '—',
                    totalOrders: 0,
                    totalSpent: 0,
                    lastOrderDate: order.created_at
                });
            }

            const customer = customerMap.get(id);
            customer.totalOrders++;
            customer.totalSpent += Number(order.total_amount);
            if (new Date(order.created_at) > new Date(customer.lastOrderDate)) {
                customer.lastOrderDate = order.created_at;
            }
        }

        return Array.from(customerMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent); // Top spenders first
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

        const { count: subscriberCount } = await supabase
            .from('newsletter_subscriptions')
            .select('*', { count: 'exact', head: true });

        const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

        return {
            totalProducts: productCount || 0,
            totalOrders: orderCount || 0,
            totalRevenue,
            totalSubscribers: subscriberCount || 0
        };
    }
};
