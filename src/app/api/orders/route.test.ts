import { describe, it, expect, vi, beforeEach } from 'vitest'

const { dbMock, txMock, requireSessionUserMock } = vi.hoisted(() => {
  const txMock = {
    user: { findUnique: vi.fn(), update: vi.fn() },
    transaction: { create: vi.fn() },
    order: { create: vi.fn() },
    subscription: { create: vi.fn() },
    serviceTask: { create: vi.fn() },
  }
  const dbMock = {
    plan: { findUnique: vi.fn() },
    order: { findMany: vi.fn() },
    $transaction: vi.fn(),
  }
  const requireSessionUserMock = vi.fn()
  return { dbMock, txMock, requireSessionUserMock }
})

vi.mock('@/lib/db', () => ({ db: dbMock }))
vi.mock('@/lib/server/plans', () => ({ ensurePlanCatalog: vi.fn() }))
vi.mock('@/lib/auth/request', () => ({
  requireSessionUser: requireSessionUserMock,
  routeErrorResponse: vi.fn((e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Internal Server Error'
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }),
}))
vi.mock('@/lib/server/serializers', () => ({ serializeOrder: vi.fn((o) => o) }))

import { POST } from './route'

const mockUser = {
  id: 'user_1',
  usdBalance: 10000,
  role: 'USER' as const,
  privyUserId: 'p1',
  email: null,
  walletAddress: null,
  name: null,
  avatarUrl: null,
}
const mockPlan = {
  id: 'plan_1',
  slug: 'trial-pack',
  name: 'Trial',
  category: 'SERVICE_PLAN',
  priceUsd: 900,
  usdCost: 900,
  isActive: true,
  durationDays: null,
  features: [],
}
const mockEnterprisePlan = {
  id: 'plan_e',
  slug: 'enterprise-sub',
  name: 'Enterprise',
  category: 'SUBSCRIPTION_PLAN',
  priceUsd: 0,
  usdCost: 0,
  isActive: true,
  durationDays: 30,
  features: [],
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireSessionUserMock.mockResolvedValue(mockUser)
    txMock.user.findUnique.mockResolvedValue({ usdBalance: mockUser.usdBalance })
    txMock.user.update.mockResolvedValue({})
    txMock.transaction.create.mockResolvedValue({})
    txMock.order.create.mockResolvedValue({ ...mockPlan, id: 'order_1', plan: mockPlan })
    txMock.serviceTask.create.mockResolvedValue({})
    dbMock.$transaction.mockImplementation((fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock))
  })

  it('rejects enterprise-sub (purchasable: false)', async () => {
    dbMock.plan.findUnique.mockResolvedValue(mockEnterprisePlan)
    const res = await POST(makeRequest({ planSlug: 'enterprise-sub' }))
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toMatch(/contacting sales/)
  })

  it('rejects when plan is inactive', async () => {
    dbMock.plan.findUnique.mockResolvedValue({ ...mockPlan, isActive: false })
    const res = await POST(makeRequest({ planSlug: 'trial-pack' }))
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toMatch(/not found or inactive/)
  })

  it('rejects when balance is insufficient inside transaction', async () => {
    dbMock.plan.findUnique.mockResolvedValue(mockPlan)
    txMock.user.findUnique.mockResolvedValue({ usdBalance: 0 })
    const res = await POST(makeRequest({ planSlug: 'trial-pack' }))
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Insufficient balance')
  })

  it('uses atomic decrement (not absolute write) for balance', async () => {
    dbMock.plan.findUnique.mockResolvedValue(mockPlan)
    const res = await POST(makeRequest({ planSlug: 'trial-pack' }))
    expect(res.status).toBe(201)
    const updateCall = txMock.user.update.mock.calls[0][0] as { data: { usdBalance: unknown } }
    expect(updateCall.data.usdBalance).toEqual({ decrement: mockPlan.usdCost })
  })
})
