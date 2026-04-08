import { beforeEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

function makeRequest(path: string, spoofedIp?: string) {
  const req = new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: spoofedIp ? { 'x-forwarded-for': spoofedIp } : {},
  })
  return req
}

describe('proxy rate limiting', () => {
  // Re-import the module fresh for each test so the in-memory store is clean.
  let proxy: (req: NextRequest) => import('next/server').NextResponse | undefined

  beforeEach(async () => {
    const { vi } = await import('vitest')
    vi.resetModules()
    const mod = await import('./proxy')
    proxy = mod.proxy
  })

  // --- admin login ---

  it('rate limits admin login globally — spoofing x-forwarded-for does not bypass the limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = proxy(makeRequest('/api/admin/auth/login', `192.168.1.${i}`))
      expect(res?.status).not.toBe(429)
    }
    const blocked = proxy(makeRequest('/api/admin/auth/login', '10.99.99.99'))
    expect(blocked?.status).toBe(429)
  })

  it('admin login: bucket is shared across all IPs', async () => {
    for (let i = 0; i < 5; i++) proxy(makeRequest('/api/admin/auth/login', '1.2.3.4'))
    expect(proxy(makeRequest('/api/admin/auth/login', '5.6.7.8'))?.status).toBe(429)
  })

  // --- /api/orders ---

  it('orders: spoofing x-forwarded-for does not bypass the limit', async () => {
    for (let i = 0; i < 10; i++) {
      proxy(makeRequest('/api/orders', `10.0.0.${i}`))
    }
    // Different spoofed IP still blocked — global bucket
    expect(proxy(makeRequest('/api/orders', '99.99.99.99'))?.status).toBe(429)
  })

  it('orders: bucket is shared across all IPs', async () => {
    for (let i = 0; i < 10; i++) proxy(makeRequest('/api/orders', '1.1.1.1'))
    expect(proxy(makeRequest('/api/orders', '2.2.2.2'))?.status).toBe(429)
  })

  // --- /api/recharge-orders ---

  it('recharge-orders: spoofing x-forwarded-for does not bypass the limit', async () => {
    for (let i = 0; i < 5; i++) {
      proxy(makeRequest('/api/recharge-orders', `10.0.0.${i}`))
    }
    expect(proxy(makeRequest('/api/recharge-orders', '99.99.99.99'))?.status).toBe(429)
  })

  // --- /api/tasks ---

  it('tasks: spoofing x-forwarded-for does not bypass the limit', async () => {
    for (let i = 0; i < 20; i++) {
      proxy(makeRequest('/api/tasks', `10.0.0.${i}`))
    }
    expect(proxy(makeRequest('/api/tasks', '99.99.99.99'))?.status).toBe(429)
  })
})
