import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const collectionId = params.id;

        // Fetch products filtered by category_id
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', collectionId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const formattedProducts = products.map(p => ({
            id: p.id,
            title: p.name,
            price: p.price,
            sku: p.id,
            image: p.image,
            status: 'active'
        }));

        return NextResponse.json({
            data: formattedProducts
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
