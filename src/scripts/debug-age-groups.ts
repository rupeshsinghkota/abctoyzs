
import { fetchProducts } from '@/lib/data';

async function main() {
    console.log('Fetching products...');
    const products = await fetchProducts();

    console.log(`Found ${products.length} products.`);

    const ageGroups: Record<string, number> = {};

    products.forEach(p => {
        const group = p.ageGroup || 'undefined';
        ageGroups[group] = (ageGroups[group] || 0) + 1;

        if (group === '6-10' || group === '10-plus' || group === 'undefined') {
            console.log(`[${group}] ${p.name} (Slug: ${p.slug}, ID: ${p.id})`);
        }
    });

    console.log('\nAge Group Distribution:', ageGroups);
}

main().catch(console.error);
