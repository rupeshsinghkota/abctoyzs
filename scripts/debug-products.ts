
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProducts() {
    console.log("Fetching products...");
    const { data: products, error } = await supabase.from('products').select('*');

    if (error) {
        console.error("Error fetching products:", error);
        return;
    }

    console.log(`Fetched ${products?.length} products from DB.`);

    if (!products) return;

    const ageGroups = products.map(p => ({
        name: p.name,
        age_group: p.age_group,
        slug: p.slug
    }));

    console.log("Age Groups in DB:", JSON.stringify(ageGroups, null, 2));
}

debugProducts();
