import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('getAdminSessionSecret', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns ADMIN_SESSION_SECRET when set', async () => {
    process.env.ADMIN_SESSION_SECRET = 'my-dedicated-secret'
    const { getAdminSessionSecret } = await import('./env')
    expect(getAdminSessionSecret()).toBe('my-dedicated-secret')
  })

  it('throws when ADMIN_SESSION_SECRET is not set', async () => {
    delete process.env.ADMIN_SESSION_SECRET
    const { getAdminSessionSecret } = await import('./env')
    expect(() => getAdminSessionSecret()).toThrow('Missing required environment variable: ADMIN_SESSION_SECRET')
  })

  it('does not fall back to PRIVY_APP_SECRET when ADMIN_SESSION_SECRET is missing', async () => {
    delete process.env.ADMIN_SESSION_SECRET
    process.env.PRIVY_APP_SECRET = 'privy-secret-should-not-be-used'
    const { getAdminSessionSecret } = await import('./env')
    expect(() => getAdminSessionSecret()).toThrow()
  })
})
