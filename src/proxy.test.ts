import { beforeEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

// Import after each test resets the module so the in-memory store is fresh.
// We re-import proxy in each describe block via a helper.

function makeLoginRequest(spoofedIp?: string) {
  const req = new NextRequest('http://localhost/api/admin/auth/login', {
    method: 'POST',
    headers: spoofedIp ? { 'x-forwarded-for': spoofedIp } : {},
  })
  return req
}

function makeOrderRequest(ip: string) {
  return new NextRequest('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
  })
}

describe('proxy rate limiting', () => {
  // Re-import the module fresh for each test so the in-memory store is clean.
  // vitest isolates modules per file but not per test — we reset by re-importing
  // after clearing the module cache via vi.resetModules().
  let proxy: (req: NextRequest) => import('next/server').NextResponse | undefined

  beforeEach(async () => {
    const { vi } = await import('vitest')
    vi.resetModules()
    const mod = await import('./proxy')
    proxy = mod.proxy
  })

  it('rate limits admin login globally — spoofing x-forwarded-for does not bypass the limit', async () => {
    // Exhaust the 5-per-minute global limit with 5 different spoofed IPs
    for (let i = 0; i < 5; i++) {
      const res = proxy(makeLoginRequest(`192.168.1.${i}`))
      expect(res?.status).not.toBe(429)
    }

    // 6th request with a brand-new spoofed IP must still be blocked
    const blocked = proxy(makeLoginRequest('10.99.99.99'))
    expect(blocked?.status).toBe(429)
  })

  it('admin login rate limit is shared across all IPs (global key)', async () => {
    // Fill the bucket from one IP
    for (let i = 0; i < 5; i++) {
      proxy(makeLoginRequest('1.2.3.4'))
    }
    // A completely different IP is still blocked
    const blocked = proxy(makeLoginRequest('5.6.7.8'))
    expect(blocked?.status).toBe(429)
  })

  it('non-admin routes still use per-IP rate limiting', async () => {
    // Exhaust limit for IP A on /api/orders
    for (let i = 0; i < 10; i++) {
      proxy(makeOrderRequest('1.1.1.1'))
    }
    // IP A is blocked
    expect(proxy(makeOrderRequest('1.1.1.1'))?.status).toBe(429)
    // IP B is not blocked
    expect(proxy(makeOrderRequest('2.2.2.2'))?.status).not.toBe(429)
  })
})
