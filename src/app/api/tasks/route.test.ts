import { describe, it, expect, vi, beforeEach } from 'vitest'

const { dbMock, requireSessionUserMock } = vi.hoisted(() => {
  const dbMock = {
    serviceTask: { findMany: vi.fn(), create: vi.fn() },
    order: { findFirst: vi.fn() },
  }
  const requireSessionUserMock = vi.fn()
  return { dbMock, requireSessionUserMock }
})

vi.mock('@/lib/db', () => ({ db: dbMock }))
vi.mock('@/lib/auth/request', () => ({
  requireSessionUser: requireSessionUserMock,
  routeErrorResponse: vi.fn((e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Internal Server Error'
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }),
}))
vi.mock('@/lib/server/serializers', () => ({ serializeTask: vi.fn((t) => t) }))

import { POST } from './route'

const mockUser = {
  id: 'user_1',
  usdBalance: 5000,
  role: 'USER' as const,
  privyUserId: 'p1',
  email: null,
  walletAddress: null,
  name: null,
  avatarUrl: null,
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = { type: 'FOLLOW', targetAccount: '@test', orderId: 'order_1' }

describe('POST /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireSessionUserMock.mockResolvedValue(mockUser)
  })

  it('returns 403 for any authenticated user (manual creation disabled)', async () => {
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(403)
    const body = await res.json() as { error: string }
    expect(body.error).toMatch(/automatically/)
  })

  it('returns 403 even without orderId (no bypass possible)', async () => {
    const res = await POST(makeRequest({ type: 'FOLLOW', targetAccount: '@test' }))
    expect(res.status).toBe(403)
  })

  it('never creates a task record', async () => {
    await POST(makeRequest(validBody))
    expect(dbMock.serviceTask.create).not.toHaveBeenCalled()
  })

  it('propagates auth errors via routeErrorResponse', async () => {
    requireSessionUserMock.mockRejectedValue(new Error('auth failed'))
    const res = await POST(makeRequest(validBody))
    // routeErrorResponse mock returns 500 for non-Response errors
    expect(res.status).toBe(500)
    expect(dbMock.serviceTask.create).not.toHaveBeenCalled()
  })
})
