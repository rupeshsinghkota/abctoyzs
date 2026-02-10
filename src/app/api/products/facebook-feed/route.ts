import { fetchProducts } from '@/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const products = await fetchProducts();
        const baseUrl = 'https://abctoyz.in';

        // Helper to clean strings for XML (strip HTML then escape)
        const clean = (str: string) => {
            if (!str) return '';
            // Strip HTML tags
            const text = str.replace(/<[^>]*>/g, ' ');
            // Escape special chars
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').trim();
        };

        const cdata = (str: string) => `<![CDATA[${str}]]>`;

        // Helper to get case-insensitive attribute
        const getAttr = (attrs: Record<string, string> | undefined, key: string) => {
            if (!attrs) return undefined;
            const k = Object.keys(attrs).find(k => k.toLowerCase() === key.toLowerCase());
            return k ? attrs[k] : undefined;
        };

        const items = products.flatMap(product => {
            // Determine base availability
            const isBaseInStock = (product as any).stock !== undefined ? (product as any).stock > 0 : true;

            // --- FACEBOOK SPECIFIC OPTIMIZATION ---
            // 1. Image Strategy: Prioritize AI Square Ad from the first Set -> Original Product Image
            const adSets = Array.isArray(product.ad_creatives) ? product.ad_creatives : (product.ad_creatives ? [product.ad_creatives] : []);

            const firstSquare = adSets.length > 0 ? adSets[0].square : null;
            // For the main product entry, we WANT the poster if available
            const socialImage = firstSquare || product.image;

            // Collect ALL AI images from ALL sets, but group by ratio to protect Carousel ads
            let squareAds: string[] = [];
            let otherAds: string[] = [];

            adSets.forEach(set => {
                if (set.square && set.square !== socialImage) squareAds.push(set.square);
                if (set.story) otherAds.push(set.story);
                if (set.landscape) otherAds.push(set.landscape);
            });

            // Squares first for Carousel consistency, followed by Story/Landscape for placement optimization
            let additionalImages = [...squareAds, ...otherAds, ...(product.images || []).filter(img => img !== socialImage)];

            // 2. Title Strategy: Clean Title
            // User requested to remove "Best Seller" or other tags from the title.
            const socialTitle = product.name;

            // Base product data
            const baseItem = {
                id: product.id,
                title: socialTitle,
                description: product.description || product.name,
                link: `${baseUrl}/product/${product.slug}?utm_source=facebook&utm_medium=cpc&utm_campaign=feed`, // Added UTM tracking
                image: socialImage,
                additional_images: additionalImages,
                brand: 'ABC Toyz',
                condition: 'new',
                availability: isBaseInStock ? 'in_stock' : 'out_of_stock',
                price: `${product.mrp || product.price} INR`,
                sale_price: product.mrp && product.mrp > product.price ? `${product.price} INR` : undefined,
                google_category: 'Toys & Games > Toys > Riding Toys > Electric Riding Toys',
                category: product.category,
                mpn: product.id,
                custom_label_0: 'Facebook_Feed', // Tag to identify source
                custom_label_1: product.tag || 'Regular', // Campaign segmentation
            };

            // If no variants, return single item
            if (!product.variants || product.variants.length === 0) {
                return [baseItem];
            }

            // If variants exist, map each variant to an item
            return product.variants.map(variant => {
                const color = getAttr(variant.attributes, 'color');
                const voltage = getAttr(variant.attributes, 'voltage') || product.voltage;
                const isVariantInStock = variant.stock !== undefined ? variant.stock > 0 : isBaseInStock;

                let variantTitle = socialTitle;
                if (color) variantTitle += ` - ${color}`;
                if (voltage && voltage !== product.voltage) variantTitle += ` (${voltage})`;

                const variantPrice = variant.price || product.price;
                const variantMrp = variant.mrp || product.mrp;
                const displayPrice = variantMrp || variantPrice;
                const salePrice = variantMrp && variantMrp > variantPrice ? variantPrice : undefined;

                // Construct Variant Deep Link
                const params = new URLSearchParams();
                if (color) params.set('color', color);
                if (voltage) params.set('voltage', voltage);

                // Note: Facebook Base Link already has UTM params, so use '&'
                // baseItem.link is "...slug?utm_source=facebook..."
                const variantLink = params.toString()
                    ? `${baseItem.link}&${params.toString()}`
                    : baseItem.link;

                const variantAdData = (variant as any).ad_creatives;
                const variantAdSets = Array.isArray(variantAdData) ? variantAdData : (variantAdData ? [variantAdData] : []);

                const variantFirstSquare = variantAdSets.length > 0 ? variantAdSets[0].square : null;
                // CRITICAL: Variants should fall back to product.image (ORIGINAL), not socialImage (which might be a Main Ad Poster with wrong color)
                const variantImage = variantFirstSquare || variant.image || product.image;

                // Collect variant-specific AI images, grouping squares first
                let variantSquares: string[] = [];
                let variantOthers: string[] = [];

                variantAdSets.forEach(set => {
                    if (set.square && set.square !== variantImage) variantSquares.push(set.square);
                    if (set.story) variantOthers.push(set.story);
                    if (set.landscape) variantOthers.push(set.landscape);
                });

                // Priority: Variant Squares -> Variant Story/Landscape -> Base Product Assets
                let variantAdditionalImages = [...variantSquares, ...variantOthers, ...(product.images || []).filter(img => img !== variantImage)];

                return {
                    ...baseItem,
                    id: variant.id,
                    item_group_id: product.id,
                    title: variantTitle,
                    link: variantLink, // Use specific variant link
                    image: variantImage,
                    additional_images: variantAdditionalImages,
                    availability: isVariantInStock ? 'in_stock' : 'out_of_stock',
                    price: `${displayPrice} INR`,
                    sale_price: salePrice ? `${salePrice} INR` : undefined,
                    color: color,
                    size: voltage,
                    mpn: variant.sku || variant.id
                };
            });
        });

        const xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>ABC Toyz Facebook Catalog</title>
    <link>${baseUrl}</link>
    <description>Premium Ride-on Cars - Optimized for Facebook &amp; Instagram</description>
    ${items.map(item => `
    <item>
      <g:id>${item.id}</g:id>
      <g:title>${cdata(item.title)}</g:title>
      <g:description>${cdata(clean(item.description))}</g:description>
      <g:link>${clean(item.link)}</g:link>
      <g:image_link>${item.image}</g:image_link>
      <g:brand>${clean(item.brand)}</g:brand>
      <g:condition>${item.condition}</g:condition>
      <g:availability>${item.availability}</g:availability>
      <g:price>${item.price}</g:price>
      ${item.sale_price ? `<g:sale_price>${item.sale_price}</g:sale_price>` : ''}
      ${(item as any).additional_images && (item as any).additional_images.length > 0
                ? (item as any).additional_images.slice(0, 10).map((img: string) => `<g:additional_image_link>${clean(img)}</g:additional_image_link>`).join('\n      ')
                : ''}
      <g:google_product_category>${clean(item.google_category)}</g:google_product_category>
      <g:custom_label_0>${clean(item.custom_label_0)}</g:custom_label_0>
      <g:custom_label_1>${clean(item.custom_label_1)}</g:custom_label_1>
      <g:mpn>${clean(item.mpn)}</g:mpn>
      ${(item as any).item_group_id ? `<g:item_group_id>${(item as any).item_group_id}</g:item_group_id>` : ''}
      ${(item as any).color ? `<g:color>${clean((item as any).color)}</g:color>` : ''}
      ${(item as any).size ? `<g:size>${clean((item as any).size)}</g:size>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Error generating FB feed:', error);
        return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
    }
}
