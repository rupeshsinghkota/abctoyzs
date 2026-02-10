import { createClient } from '@/lib/supabase/client';

export type OrderItem = {
    id: string;
    product_id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
};

export type Order = {
    id: string;
    user_id: string;
    total_amount: number;
    currency: string;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    created_at: string;
    items?: OrderItem[];
};

export const OrderService = {
    async getOrders() {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Fetch orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!orders) return [];

        // Fetch items for these orders (could be optimized with a join if relationship defined, but separate query is safe)
        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        if (itemsError) throw itemsError;

        // Group items by order
        const ordersWithItems = orders.map(order => ({
            ...order,
            items: items?.filter(item => item.order_id === order.id) || []
        }));

        return ordersWithItems as Order[];
    },

    async getOrderById(id: string) {
        const supabase = createClient();
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!order) return null;

        const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

        return { ...order, items: items || [] } as Order;
    },

    // Create a real order from checkout
    async createOrder(orderData: {
        total_amount: number;
        shipping_address_id: string;
        items: {
            product_id: number;
            product_name: string;
            product_image: string;
            quantity: number;
            price: number;
        }[];
    }) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        // Create Order
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: orderData.total_amount,
                shipping_address_id: orderData.shipping_address_id,
                status: 'processing'
            })
            .select()
            .single();

        if (error) throw error;

        // Create Order Items
        const itemsToInsert = orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemError) throw itemError;
        return order;
    },

    // Helper to create a mock order (for testing)
    async createMockOrder() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        // Create Order
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: 599.99,
                status: 'processing'
            })
            .select()
            .single();

        if (error) throw error;

        // Create Items
        const { error: itemError } = await supabase
            .from('order_items')
            .insert([
                {
                    order_id: order.id,
                    product_id: 1,
                    product_name: 'Lamborghini Aventador 24V Drift',
                    product_image: '/hero/hero_car_1769365166894.png',
                    price: 599.99,
                    quantity: 1
                }
            ]);

        if (itemError) throw itemError;
        return order;
    }
};
