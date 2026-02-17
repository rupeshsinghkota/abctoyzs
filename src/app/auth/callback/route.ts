import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') || 'magiclink'

    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/profile'

    const supabase = await createClient()

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return redirectToNext(request, origin, next)
        }
        console.error('[Auth Callback] Code exchange error:', error)
    }

    if (token_hash) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
        })
        if (!error) {
            return redirectToNext(request, origin, next)
        }
        console.error('[Auth Callback] Token hash verify error:', error)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

function redirectToNext(request: Request, origin: string, next: string) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
        return NextResponse.redirect(`${origin}${next}`)
    }
}
