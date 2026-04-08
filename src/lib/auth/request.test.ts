import { describe, it, expect, vi } from 'vitest'

// Minimal mocks so the module can be imported without real Prisma/Privy
vi.mock('@/lib/db', () => ({ db: { user: { upsert: vi.fn(), update: vi.fn() } } }))
vi.mock('@/lib/env', () => ({ getBootstrapAdminEmails: vi.fn(() => '') }))
vi.mock('@/lib/auth/admin', () => ({
  isBootstrapAdmin: vi.fn(() => false),
  parseBootstrapAdminEmails: vi.fn(() => []),
}))
vi.mock('@/lib/privy', () => ({
  getPrivyClient: vi.fn(() => ({ verifyAuthToken: vi.fn() })),
}))

import { routeErrorResponse } from './request'

describe('routeErrorResponse', () => {
  it('returns 500 with generic message for unknown errors', async () => {
    const res = routeErrorResponse(new Error('PrismaClientKnownRequestError: ...'))
    expect(res.status).toBe(500)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Internal Server Error')
  })

  it('returns 500 with generic message for non-Error throws', async () => {
    const res = routeErrorResponse('something bad')
    expect(res.status).toBe(500)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Internal Server Error')
  })

  it('passes through known business error: Insufficient balance', async () => {
    const res = routeErrorResponse(new Error('Insufficient balance'))
    expect(res.status).toBe(500)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Insufficient balance')
  })

  it('passes through known business error: Recharge order is not pending', async () => {
    const res = routeErrorResponse(new Error('Recharge order is not pending'))
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Recharge order is not pending')
  })

  it('returns the Response as-is when error is a Response (auth errors)', () => {
    const authError = new Response('Unauthorized', { status: 401 })
    const result = routeErrorResponse(authError)
    expect(result).toBe(authError)
  })
})
