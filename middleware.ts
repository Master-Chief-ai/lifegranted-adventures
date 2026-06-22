import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const publicPaths = [
    '/',
    '/tours',
    '/operators',
    '/destinations',
    '/blog',
    '/about',
    '/for-operators',
    '/contact',
    '/legal',
    '/auth',
    '/operator/register',
  ]
  const isPublic =
    publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.includes('/api/webhooks') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'

  if (isPublic || !isSupabaseConfigured()) {
    return NextResponse.next({ request })
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role || 'tourist'

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname.startsWith('/portal')) {
    if (role !== 'operator' && role !== 'admin') {
      return NextResponse.redirect(new URL('/operator/register', request.url))
    }
    if (role === 'operator') {
      const { data: operator } = await supabase.from('operators').select('status').eq('user_id', user.id).single()
      if (
        operator?.status === 'pending' &&
        !pathname.startsWith('/portal/pending') &&
        !pathname.startsWith('/portal/stripe-callback')
      ) {
        return NextResponse.redirect(new URL('/portal/pending', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|placeholder).*)'],
}
