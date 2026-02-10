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

    // Helper to build rich description with Specs and Box Content
    const buildRichDescription = (product: any) => {
      let desc = product.description || product.name || '';

      // Append Specifications
      if (product.specs) {
        const specsList: string[] = [];
        for (const [key, value] of Object.entries(product.specs)) {
          if (value === undefined || value === null || value === '') continue;
          // Format key: mobile_app -> Mobile App
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

          if (Array.isArray(value)) {
            if (value.length > 0) specsList.push(`${label}: ${value.join(', ')}`);
          } else if (typeof value === 'boolean') {
            specsList.push(`${label}: ${value ? 'Yes' : 'No'}`);
          } else {
            specsList.push(`${label}: ${value}`);
          }
        }

        if (specsList.length > 0) {
          desc += '\n\nSpecifications:\n' + specsList.map(s => `• ${s}`).join('\n');
        }
      }

      // Append Box Content
      if (product.box_content && Array.isArray(product.box_content) && product.box_content.length > 0) {
        desc += '\n\nWhat\'s in the Box:\n' + product.box_content.map((item: string) => `• ${item}`).join('\n');
      }

      return desc;
    };

    const items = products.flatMap(product => {
      // Determine base availability
      const isBaseInStock = (product as any).stock !== undefined ? (product as any).stock > 0 : true;

      // Build enhanced description
      const richDescription = buildRichDescription(product);

      // Base product data
      const baseItem = {
        id: product.id,
        title: product.name,
        description: richDescription,
        link: `${baseUrl}/product/${product.slug}`,
        image: product.image,
        additional_images: product.images?.filter(img => img !== product.image).slice(0, 10) || [],
        brand: 'ABC Toyz',
        condition: 'new',
        availability: isBaseInStock ? 'in_stock' : 'out_of_stock',
        price: `${product.mrp || product.price} INR`,
        sale_price: product.mrp && product.mrp > product.price ? `${product.price} INR` : undefined,
        shipping: { country: 'IN', service: 'Standard', price: '0 INR' },
        google_category: 'Toys & Games > Toys > Riding Toys > Electric Riding Toys',
        category: product.category,
        mpn: product.id,
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

        let variantTitle = product.name;
        if (color) variantTitle += ` - ${color}`;
        if (voltage && voltage !== product.voltage) variantTitle += ` (${voltage})`;

        const variantPrice = variant.price || product.price;
        const variantMrp = variant.mrp || product.mrp;
        const displayPrice = variantMrp || variantPrice;
        const salePrice = variantMrp && variantMrp > variantPrice ? variantPrice : undefined;

        return {
          ...baseItem,
          id: variant.id,
          item_group_id: product.id,
          title: variantTitle,
          image: variant.image || product.image,
          additional_images: baseItem.additional_images,
          availability: isVariantInStock ? 'in_stock' : 'out_of_stock',
          price: `${displayPrice} INR`,
          sale_price: salePrice ? `${salePrice} INR` : undefined,
          color: color,
          size: voltage,
          custom_label_1: voltage,
          mpn: variant.sku || variant.id
        };
      });
    });

    const xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>ABC Toyz Product Feed</title>
    <link>${baseUrl}</link>
    <description>Premium Ride-on Cars, Bikes, and Jeeps for Kids</description>
    ${items.map(item => `
    <item>
      <g:id>${item.id}</g:id>
      <g:title>${cdata(item.title)}</g:title>
      <g:description>${cdata(clean(item.description))}</g:description>
      <g:link>${item.link}</g:link>
      <g:image_link>${item.image}</g:image_link>
      ${item.additional_images.map(img => `<g:additional_image_link>${img}</g:additional_image_link>`).join('')}
      <g:brand>${clean(item.brand)}</g:brand>
      <g:condition>${item.condition}</g:condition>
      <g:availability>${item.availability}</g:availability>
      <g:price>${item.price}</g:price>
      ${item.sale_price ? `<g:sale_price>${item.sale_price}</g:sale_price>` : ''}
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0 INR</g:price>
      </g:shipping>
      <g:google_product_category>${clean(item.google_category)}</g:google_product_category>
      <g:custom_label_0>${clean(item.category)}</g:custom_label_0>
      <g:mpn>${clean(item.mpn)}</g:mpn>
      ${(item as any).item_group_id ? `<g:item_group_id>${(item as any).item_group_id}</g:item_group_id>` : ''}
      ${(item as any).color ? `<g:color>${clean((item as any).color)}</g:color>` : ''}
      ${(item as any).size ? `<g:size>${clean((item as any).size)}</g:size>` : ''}
      ${(item as any).custom_label_1 ? `<g:custom_label_1>${clean((item as any).custom_label_1)}</g:custom_label_1>` : ''}
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
    console.error('Error generating feed:', error);
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}
