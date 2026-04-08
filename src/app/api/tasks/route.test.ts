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
const mockOrder = { id: 'order_1', userId: 'user_1', status: 'ACTIVE' }

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
    dbMock.serviceTask.create.mockResolvedValue({ id: 'task_1', ...validBody, status: 'QUEUED' })
  })

  it('rejects when orderId is missing', async () => {
    const res = await POST(makeRequest({ type: 'FOLLOW', targetAccount: '@test' }))
    expect(res.status).toBe(400)
  })

  it('rejects when order does not belong to user', async () => {
    dbMock.order.findFirst.mockResolvedValue(null)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(404)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Order not found')
  })

  it('rejects when order is not ACTIVE', async () => {
    dbMock.order.findFirst.mockResolvedValue({ ...mockOrder, status: 'COMPLETED' })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Order is not active')
  })

  it('creates task when order is valid and ACTIVE', async () => {
    dbMock.order.findFirst.mockResolvedValue(mockOrder)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    expect(dbMock.serviceTask.create).toHaveBeenCalledOnce()
  })

  it('passes orderId ownership check (userId filter)', async () => {
    dbMock.order.findFirst.mockResolvedValue(mockOrder)
    await POST(makeRequest(validBody))
    const findCall = dbMock.order.findFirst.mock.calls[0][0] as { where: { id: string; userId: string } }
    expect(findCall.where.userId).toBe(mockUser.id)
    expect(findCall.where.id).toBe('order_1')
  })
})
