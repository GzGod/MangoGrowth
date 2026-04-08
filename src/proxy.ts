import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (suitable for single-instance deployment)
type RateLimitEntry = { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateLimitEntry>()

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= limit) return true

  entry.count++
  return false
}

// Admin login uses a global (instance-level) key — not IP-based — to prevent
// brute-force bypass via x-forwarded-for / x-real-ip spoofing.
// User-facing API routes (/api/orders, /api/recharge-orders, /api/tasks) are
// NOT rate-limited here: they require authentication, so the real protection is
// auth; per-user rate limiting is applied inside each route handler after
// requireSessionUser resolves the user identity.
const RATE_LIMIT_RULES: Array<[string, string, number]> = [
  ['/api/admin/auth/login', 'POST', 5],
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Admin page protection: redirect to login if no session cookie
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('mango_admin_session')
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Rate limiting for admin login only
  for (const [path, limitMethod, limit] of RATE_LIMIT_RULES) {
    if (pathname === path && method === limitMethod) {
      if (isRateLimited(`global:${path}:${method}`, limit, 60_000)) {
        return new NextResponse(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        })
      }
      break
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/auth/login',
  ],
}
