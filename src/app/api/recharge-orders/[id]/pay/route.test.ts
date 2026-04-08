import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { dbMock, txMock, requireSessionUserMock, balanceMock, x402Mock } = vi.hoisted(() => {
  const txMock = {
    rechargeOrder: { updateMany: vi.fn(), findUniqueOrThrow: vi.fn() },
    transaction: { create: vi.fn() },
  }
  const dbMock = {
    rechargeOrder: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  }
  const requireSessionUserMock = vi.fn()
  const balanceMock = { adjustBalanceReturning: vi.fn() }
  let capturedRouteConfig: ((req: NextRequest) => Promise<unknown>) | null = null
  const x402Mock = {
    get capturedRouteConfig() { return capturedRouteConfig },
    withX402: vi.fn((handler: (req: Request) => Promise<Response>, _addr: unknown, routeConfig: (req: NextRequest) => Promise<unknown>) => {
      capturedRouteConfig = routeConfig
      return handler
    }),
  }
  return { dbMock, txMock, requireSessionUserMock, balanceMock, x402Mock }
})

vi.mock('@/lib/db', () => ({ db: dbMock }))
vi.mock('@/lib/auth/request', () => ({ requireSessionUser: requireSessionUserMock }))
vi.mock('@/lib/server/serializers', () => ({ serializeRechargeOrder: vi.fn((o) => o) }))
vi.mock('@coinbase/cdp-sdk/auth', () => ({ generateJwt: vi.fn().mockResolvedValue('jwt') }))
vi.mock('x402-next', () => ({ withX402: x402Mock.withX402 }))
vi.mock('@/lib/db/balance', () => ({
  adjustBalanceReturning: balanceMock.adjustBalanceReturning,
}))

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

const mockPendingOrder = {
  id: 'rorder_1',
  userId: 'user_1',
  status: 'PENDING',
  amountUsd: 1000,
}

function makeRequest(orderId = 'rorder_1') {
  return new NextRequest(`http://localhost/api/recharge-orders/${orderId}/pay`, {
    method: 'POST',
    headers: { Authorization: 'Bearer token' },
  })
}

describe('POST /api/recharge-orders/[id]/pay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireSessionUserMock.mockResolvedValue(mockUser)
    dbMock.rechargeOrder.findFirst.mockResolvedValue(mockPendingOrder)
    txMock.rechargeOrder.updateMany.mockResolvedValue({ count: 1 })
    txMock.rechargeOrder.findUniqueOrThrow.mockResolvedValue({ ...mockPendingOrder, status: 'PAID' })
    balanceMock.adjustBalanceReturning.mockResolvedValue(6000)
    txMock.transaction.create.mockResolvedValue({})
    dbMock.$transaction.mockImplementation(
      (fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock),
    )
  })

  it('succeeds for a PENDING order', async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(txMock.rechargeOrder.updateMany).toHaveBeenCalledOnce()
    expect(balanceMock.adjustBalanceReturning).toHaveBeenCalledOnce()
    expect(txMock.transaction.create).toHaveBeenCalledOnce()
  })

  it('rejects when order is not found', async () => {
    dbMock.rechargeOrder.findFirst.mockResolvedValue(null)
    const res = await POST(makeRequest())
    expect(res.status).toBe(404)
    expect(balanceMock.adjustBalanceReturning).not.toHaveBeenCalled()
  })

  it('rejects when order is already PAID (pre-tx check)', async () => {
    dbMock.rechargeOrder.findFirst.mockResolvedValue({ ...mockPendingOrder, status: 'PAID' })
    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Recharge order is not pending')
    expect(dbMock.$transaction).not.toHaveBeenCalled()
  })

  it('rejects when atomic status transition fails (concurrent duplicate)', async () => {
    txMock.rechargeOrder.updateMany.mockResolvedValue({ count: 0 })
    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Recharge order is not pending')
    // Balance must NOT have been touched
    expect(balanceMock.adjustBalanceReturning).not.toHaveBeenCalled()
    expect(txMock.transaction.create).not.toHaveBeenCalled()
  })

  it('does not create a transaction record when status transition fails', async () => {
    txMock.rechargeOrder.updateMany.mockResolvedValue({ count: 0 })
    await POST(makeRequest())
    expect(txMock.transaction.create).not.toHaveBeenCalled()
  })

  it('writes balanceAfter from the atomic RETURNING value, not a separate query', async () => {
    const atomicBalance = 6000
    balanceMock.adjustBalanceReturning.mockResolvedValue(atomicBalance)
    await POST(makeRequest())
    const txCreate = txMock.transaction.create.mock.calls[0][0] as { data: { balanceAfter: number } }
    expect(txCreate.data.balanceAfter).toBe(atomicBalance)
  })

  it('calls adjustBalanceReturning with the correct amount', async () => {
    await POST(makeRequest())
    const [, , delta] = balanceMock.adjustBalanceReturning.mock.calls[0] as [unknown, unknown, number]
    expect(delta).toBe(mockPendingOrder.amountUsd)
  })
})

describe('routeConfig (x402 payment requirements)', () => {
  it('does not query the database — no pre-auth order info leak', async () => {
    expect(x402Mock.capturedRouteConfig).not.toBeNull()
    vi.clearAllMocks()
    await x402Mock.capturedRouteConfig!(makeRequest('rorder_1'))
    expect(dbMock.rechargeOrder.findFirst).not.toHaveBeenCalled()
  })

  it('returns a fixed placeholder price regardless of order ID', async () => {
    expect(x402Mock.capturedRouteConfig).not.toBeNull()
    const result = await x402Mock.capturedRouteConfig!(makeRequest('rorder_1')) as { price: string }
    expect(result.price).toBe('$0.01')
  })
})
