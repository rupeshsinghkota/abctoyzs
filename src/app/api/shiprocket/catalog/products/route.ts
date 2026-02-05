import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const per_page = parseInt(searchParams.get('per_page') || '20');
        const start = (page - 1) * per_page;
        const end = start + per_page - 1;

        // Fetch products from Supabase
        const { data: products, error, count } = await supabase
            .from('products')
            .select('*', { count: 'exact' })
            .range(start, end);

        if (error) {
            console.error('Error fetching products:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform to Shiprocket expected format (Generic Catalog Structure)
        // Typically: id, title, price, image, etc.
        const formattedProducts = products.map(p => ({
            id: p.id,
            title: p.name,
            price: p.price,
            sku: p.id, // Using ID as SKU if specific SKU field is missing
            description: p.description,
            image: p.image,
            inventory_quantity: 100, // Default if not tracking stock
            status: 'active'
        }));

        return NextResponse.json({
            data: formattedProducts,
            meta: {
                current_page: page,
                per_page: per_page,
                total: count
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
