import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const { code, amount } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Fetch Coupon
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !coupon) {
            return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
        }

        // 2. Validate Expiry
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
        }

        // 3. Validate Usage Limit
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        }

        // 4. Validate Minimum Order Amount
        if (amount < coupon.min_order_amount) {
            return NextResponse.json({
                error: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}`
            }, { status: 400 });
        }

        const rawBody = await req.json().catch(() => ({}));
        const paymentMethod = rawBody.paymentMethod || null;

        // 5. Validate Payment Method Restriction
        if (paymentMethod && coupon.allowed_payment_method && coupon.allowed_payment_method !== 'ALL') {
            if (paymentMethod !== coupon.allowed_payment_method) {
                return NextResponse.json({
                    error: `This coupon is only valid for ${coupon.allowed_payment_method} orders.`
                }, { status: 400 });
            }
        }

        // 5. Calculate Discount
        let discount = 0;
        if (coupon.discount_type === 'PERCENTAGE') {
            discount = (amount * coupon.discount_value) / 100;
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else {
            discount = coupon.discount_value;
        }

        // Ensure discount doesn't exceed amount
        if (discount > amount) discount = amount;

        return NextResponse.json({
            valid: true,
            coupon_id: coupon.id,
            code: coupon.code,
            discount: Math.round(discount),
            new_total: Math.round(amount - discount)
        });

    } catch (error) {
        console.error('Coupon Validation Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
