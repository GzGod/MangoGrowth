import { beforeEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

function makeRequest(path: string, spoofedIp?: string) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: spoofedIp ? { 'x-forwarded-for': spoofedIp } : {},
  })
}

describe('proxy rate limiting', () => {
  let proxy: (req: NextRequest) => import('next/server').NextResponse | undefined

  beforeEach(async () => {
    const { vi } = await import('vitest')
    vi.resetModules()
    const mod = await import('./proxy')
    proxy = mod.proxy
  })

  it('rate limits admin login globally — spoofing x-forwarded-for does not bypass the limit', async () => {
    for (let i = 0; i < 5; i++) {
      expect(proxy(makeRequest('/api/admin/auth/login', `192.168.1.${i}`))?.status).not.toBe(429)
    }
    // 6th request with a brand-new spoofed IP must still be blocked
    expect(proxy(makeRequest('/api/admin/auth/login', '10.99.99.99'))?.status).toBe(429)
  })

  it('admin login: bucket is shared across all IPs', async () => {
    for (let i = 0; i < 5; i++) proxy(makeRequest('/api/admin/auth/login', '1.2.3.4'))
    expect(proxy(makeRequest('/api/admin/auth/login', '5.6.7.8'))?.status).toBe(429)
  })

  it('user API routes are NOT rate-limited in the proxy (handled per-user in route handlers)', async () => {
    // Flood all three routes — proxy should never return 429 for these
    for (let i = 0; i < 30; i++) {
      expect(proxy(makeRequest('/api/orders'))?.status).not.toBe(429)
      expect(proxy(makeRequest('/api/recharge-orders'))?.status).not.toBe(429)
      expect(proxy(makeRequest('/api/tasks'))?.status).not.toBe(429)
    }
  })
})
