import { createClient } from '@supabase/supabase-js';

// WARNING: Use this only in server-side API routes or services.
// NEVER expose this client to the browser.
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
