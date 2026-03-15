import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Allow public routes
  const publicRoutes = ['/', '/login', '/signup']
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '?'))

  if (isPublic) {
    // If logged in and visiting login/signup, redirect to their dashboard
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role ?? 'applicant'
      return NextResponse.redirect(
        new URL(role === 'recruiter' ? '/recruiter' : '/applicant', request.url)
      )
    }
    return response
  }

  // Protected routes — require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based route protection
  const isRecruiterRoute = pathname.startsWith('/recruiter')
  const isApplicantRoute = pathname.startsWith('/applicant')

  if (isRecruiterRoute || isApplicantRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (isRecruiterRoute && role !== 'recruiter') {
      return NextResponse.redirect(new URL('/applicant', request.url))
    }
    if (isApplicantRoute && role !== 'applicant') {
      return NextResponse.redirect(new URL('/recruiter', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|glb)$).*)',
  ],
}
