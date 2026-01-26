import { createClient } from '@supabase/supabase-js';
import { products, start_products } from '../lib/data';

// Note: We need service role key to bypass RLS for seeding if RLS is strict, 
// OR we rely on anon key if we have insert policies. 
// For this script, we'll try to use the environment variables from .env.local
// This script is meant to be run via `npx tsx src/scripts/seed-products.ts` or similar server-side context.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProducts() {
    console.log('🌱 Starting seed...');

    // 1. Seed Categories first (if we were relational, but our product schema uses text or we need category UUIDs)
    // Our schema defined 'categories' table. Let's populate it based on unique categories in products.

    // Actually, our current product data has 'category' string (e.g. 'cars').
    // Our Schema expects category_id UUID.
    // STRATEGY: 
    // 1. Insert Categories and get their IDs.
    // 2. Map product 'category' string to these IDs.
    // 3. Insert Products.

    const uniqueCategories = Array.from(new Set(products.map(p => p.category))).map(slug => ({
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug: slug,
        description: `Best ${slug} for kids`
    }));

    const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .upsert(uniqueCategories, { onConflict: 'slug' })
        .select();

    if (catError) {
        console.error('Error seeding categories:', catError);
        return;
    }

    console.log(`✅ Seeded ${categoriesData.length} categories.`);

    // Create a map of slug -> id
    const categoryMap = new Map(categoriesData.map(c => [c.slug, c.id]));

    // Prepare products
    const productsToInsert = products.map(p => ({
        name: p.name,
        slug: p.id, // Using existing ID as slug or name-based slug? Let's use name-slug or just ID for now. schema says slug is text unique. unique ID is fine.
        description: p.description,
        base_price: p.price,
        images: p.images,
        category_id: categoryMap.get(p.category),
        voltage: p.voltage,
        age_group: p.ageGroup,
        specs: p.specs,
        rating: p.rating,
        review_count: p.reviews,
        is_new: p.tag === 'New',
        // subCategory: p.subCategory // we can store this in specs or add column. Schema didn't have subcategory. Let's put in specs.
    }));

    const { error: prodError } = await supabase
        .from('products')
        .upsert(productsToInsert, { onConflict: 'slug' });

    if (prodError) {
        console.error('Error seeding products:', prodError);
    } else {
        console.log(`✅ Seeded ${productsToInsert.length} products.`);
    }
}

seedProducts();
