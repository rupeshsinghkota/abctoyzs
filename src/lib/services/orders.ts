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
    payment_method?: string;
    shiprocket_order_id?: string;
    payment_status?: string;
    razorpay_order_id?: string;
    guest_email?: string;
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

        // 1. Fetch the order details
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!order) return null;

        // 2. Fetch items for this order
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

        if (itemsError) console.error("Error fetching items:", itemsError);

        // 3. Fetch the address manually if shipping_address_id exists
        let shipping_address = null;
        if (order.shipping_address_id) {
            const { data: address, error: addressError } = await supabase
                .from('addresses')
                .select('*')
                .eq('id', order.shipping_address_id)
                .single();

            if (!addressError && address) {
                shipping_address = address;
            }
        }

        return {
            ...order,
            items: items || [],
            shipping_address
        } as Order & { shipping_address: any };
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
