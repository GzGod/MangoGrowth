import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (suitable for single-instance deployment)
type RateLimitEntry = { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

// All rate-limited API paths use a global (instance-level) key instead of IP-based.
// This prevents attackers from bypassing limits by spoofing x-forwarded-for / x-real-ip.
// These routes are all authenticated, so the real protection is auth; rate limiting
// here is a secondary defence against abuse — a global bucket is simpler and reliable.
const GLOBAL_RATE_LIMIT_PATHS = new Set([
  '/api/admin/auth/login',
  '/api/recharge-orders',
  '/api/orders',
  '/api/tasks',
])

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

// Rate limit rules: [path, method, limit per minute]
const RATE_LIMIT_RULES: Array<[string, string, number]> = [
  ['/api/recharge-orders', 'POST', 5],
  ['/api/orders', 'POST', 10],
  ['/api/tasks', 'POST', 20],
  ['/api/admin/auth/login', 'POST', 5],
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method
  const ip = getClientIp(request)

  // Admin page protection: redirect to login if no session cookie
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('mango_admin_session')
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Rate limiting for API routes
  for (const [path, limitMethod, limit] of RATE_LIMIT_RULES) {
    if (pathname === path && method === limitMethod) {
      const key = GLOBAL_RATE_LIMIT_PATHS.has(path)
        ? `global:${path}:${method}`
        : `${ip}:${path}:${method}`
      if (isRateLimited(key, limit, 60_000)) {
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
    '/api/recharge-orders',
    '/api/orders',
    '/api/tasks',
    '/api/admin/auth/login',
  ],
}
