import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .limit(10);

        if (error) throw error;

        return NextResponse.json({
            count: products?.length || 0,
            products: products
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
