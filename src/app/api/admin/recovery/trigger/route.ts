import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RecoveryService } from '@/lib/services/recovery';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Check for admin session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: admin } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        // Trigger recovery process
        const result = await RecoveryService.processAbandonedCarts();

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Recovery Trigger API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
