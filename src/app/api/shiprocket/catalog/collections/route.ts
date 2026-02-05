import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    try {
        // Fetch categories (collections)
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const formattedCollections = categories.map(c => ({
            id: c.id,
            title: c.name,
            handle: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
            image: c.image
        }));

        return NextResponse.json({
            data: formattedCollections
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
