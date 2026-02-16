import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Skip middleware for webhooks
    if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
        return response
    }

    // Refresh the session if it exists
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes
    const isProfileRoute = request.nextUrl.pathname.startsWith('/profile')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

    // Redirect to login if accessing protected route without user
    if ((isProfileRoute || isAdminRoute) && !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Admin protection logic could be expanded here by checking user metadata/roles
    // For now, we assume if they are logged in and hit /admin, they might be allowed
    // Ideally we query the 'admins' table, but middleware shouldn't do DB queries if possible.
    // We can rely on Row Level Security or a layout server check for stricter admin enforcement.

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!api/webhooks|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',



    ],
}
