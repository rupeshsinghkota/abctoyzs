
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually load environment variables from .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach((line) => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error('Error loading .env.local:', e);
}
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: In a real admin scenario, we would use the SERVICE_ROLE_KEY to bypass RLS.
// For now, we will try with the anon key, but if RLS blocks delete, we might need the service role key
// or run this in the SQL editor.
// However, since we are likely running this locally regarding a user request, we might have appropriate env vars.
// If it fails due to permissions, we'll note that.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removePartsCategory() {
    console.log('🗑️ Starting cleanup of "parts" category...');


    // 1. Check if the category exists
    const { data: categories, error: fetchError } = await supabase
        .from('categories')
        .select('id, slug, name');

    if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        return;
    }

    console.log('Current categories in DB:', categories?.map(c => `${c.name} (${c.slug})`).join(', '));

    const partsCategory = categories?.find(c => c.slug === 'parts' || c.name.toLowerCase().includes('part'));

    if (!partsCategory) {
        console.log('ℹ️ Category "parts" not found. Nothing to delete.');
        return;
    }

    console.log(`Found category: ${partsCategory.slug} (ID: ${partsCategory.id})`);

    // 2. Check for products in this category
    const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', partsCategory.id);


    if (countError) {
        console.error('Error checking for products:', countError);
        return;
    }

    if (count && count > 0) {
        console.warn(`⚠️ WARNING: There are ${count} products associated with this category.`);
        console.warn('   Deleting the category might fail due to foreign key constraints, or leave orphaned products.');
        console.warn('   Aborting deletion to be safe. Please assign these products to another category first.');
        return;
    }

    const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', partsCategory.id);

    if (deleteError) {
        console.error('❌ Error deleting category:', deleteError);
    } else {
        console.log('✅ Successfully deleted "parts" category.');
    }
}

removePartsCategory();
