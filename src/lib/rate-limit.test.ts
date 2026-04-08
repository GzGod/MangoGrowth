import { beforeEach, describe, expect, it } from 'vitest'

describe('checkUserRateLimit', () => {
  let checkUserRateLimit: (userId: string, path: string, limit: number, windowMs?: number) => boolean

  beforeEach(async () => {
    const { vi } = await import('vitest')
    vi.resetModules()
    const mod = await import('./rate-limit')
    checkUserRateLimit = mod.checkUserRateLimit
  })

  it('allows requests up to the limit', () => {
    for (let i = 0; i < 10; i++) {
      expect(checkUserRateLimit('user_a', '/api/orders', 10)).toBe(false)
    }
  })

  it('blocks the request that exceeds the limit', () => {
    for (let i = 0; i < 10; i++) checkUserRateLimit('user_b', '/api/orders', 10)
    expect(checkUserRateLimit('user_b', '/api/orders', 10)).toBe(true)
  })

  it('different users have independent buckets — one user cannot affect another', () => {
    // Exhaust user_c's bucket
    for (let i = 0; i < 5; i++) checkUserRateLimit('user_c', '/api/recharge-orders', 5)
    expect(checkUserRateLimit('user_c', '/api/recharge-orders', 5)).toBe(true)

    // user_d is unaffected
    expect(checkUserRateLimit('user_d', '/api/recharge-orders', 5)).toBe(false)
  })

  it('different paths have independent buckets for the same user', () => {
    for (let i = 0; i < 5; i++) checkUserRateLimit('user_e', '/api/orders', 5)
    expect(checkUserRateLimit('user_e', '/api/orders', 5)).toBe(true)
    // Same user, different path — not limited
    expect(checkUserRateLimit('user_e', '/api/recharge-orders', 5)).toBe(false)
  })
})
