import { describe, it, expect, vi, beforeEach } from 'vitest'

const { dbMock, txMock, requireSessionUserMock, balanceMock } = vi.hoisted(() => {
  const txMock = {
    user: { findUnique: vi.fn(), update: vi.fn(), findUniqueOrThrow: vi.fn() },
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
  const balanceMock = {
    decrementBalanceIfSufficient: vi.fn(),
  }
  return { dbMock, txMock, requireSessionUserMock, balanceMock }
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
vi.mock('@/lib/db/balance', () => ({
  decrementBalanceIfSufficient: balanceMock.decrementBalanceIfSufficient,
}))

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
    // decrementBalanceIfSufficient returns the post-update balance (atomic RETURNING value)
    balanceMock.decrementBalanceIfSufficient.mockResolvedValue(mockUser.usdBalance - 900)
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

  it('rejects when balance is insufficient (decrementBalanceIfSufficient returns null)', async () => {
    dbMock.plan.findUnique.mockResolvedValue(mockPlan)
    balanceMock.decrementBalanceIfSufficient.mockResolvedValue(null)
    const res = await POST(makeRequest({ planSlug: 'trial-pack' }))
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Insufficient balance')
  })

  it('uses decrementBalanceIfSufficient (atomic UPDATE...RETURNING helper)', async () => {
    dbMock.plan.findUnique.mockResolvedValue(mockPlan)
    const res = await POST(makeRequest({ planSlug: 'trial-pack' }))
    expect(res.status).toBe(201)
    expect(balanceMock.decrementBalanceIfSufficient).toHaveBeenCalledOnce()
    const [, , cost] = balanceMock.decrementBalanceIfSufficient.mock.calls[0] as [unknown, unknown, number]
    expect(cost).toBe(mockPlan.usdCost)
  })

  it('writes balanceAfter from the atomic RETURNING value, not a separate query', async () => {
    dbMock.plan.findUnique.mockResolvedValue(mockPlan)
    const atomicBalance = 9100
    balanceMock.decrementBalanceIfSufficient.mockResolvedValue(atomicBalance)
    await POST(makeRequest({ planSlug: 'trial-pack' }))
    const txCreate = txMock.transaction.create.mock.calls[0][0] as { data: { balanceAfter: number } }
    expect(txCreate.data.balanceAfter).toBe(atomicBalance)
    // Confirm no separate findUniqueOrThrow was called for balance
    expect(txMock.user.findUniqueOrThrow).not.toHaveBeenCalled()
  })
})
