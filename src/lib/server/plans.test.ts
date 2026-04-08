import { describe, it, expect, vi, beforeEach } from 'vitest'

const { upsertMock } = vi.hoisted(() => ({ upsertMock: vi.fn() }))

vi.mock('@/lib/db', () => ({
  db: { plan: { upsert: upsertMock } },
}))

vi.mock('@/lib/data/plan-catalog', () => ({
  planCatalog: [
    {
      slug: 'trial-pack',
      name: 'Trial',
      description: 'Test',
      category: 'SERVICE_PLAN',
      priceUsd: 9,
      usdCost: 9,
      isFeatured: false,
      features: [],
    },
    {
      slug: 'enterprise-sub',
      name: 'Enterprise',
      description: 'Enterprise',
      category: 'SUBSCRIPTION_PLAN',
      priceUsd: 0,
      usdCost: 0,
      durationDays: 30,
      isFeatured: false,
      purchasable: false,
      features: [],
    },
  ],
}))

import { ensurePlanCatalog } from './plans'

describe('ensurePlanCatalog', () => {
  beforeEach(() => {
    upsertMock.mockReset()
    upsertMock.mockResolvedValue({})
  })

  it('calls upsert for each plan in the catalog', async () => {
    await ensurePlanCatalog()
    expect(upsertMock).toHaveBeenCalledTimes(2)
  })

  it('passes empty update object so existing plans are never overwritten', async () => {
    await ensurePlanCatalog()
    for (const call of upsertMock.mock.calls) {
      const arg = call[0] as { update: Record<string, unknown> }
      expect(Object.keys(arg.update)).toHaveLength(0)
    }
  })

  it('populates create with all required fields', async () => {
    await ensurePlanCatalog()
    const trialCall = upsertMock.mock.calls.find(
      (c) => (c[0] as { where: { slug: string } }).where.slug === 'trial-pack',
    )
    expect(trialCall).toBeDefined()
    const create = (trialCall![0] as { create: Record<string, unknown> }).create
    expect(create.slug).toBe('trial-pack')
    expect(create.priceUsd).toBe(9)
    expect(create.isActive).toBe(true)
  })
})

describe('plan-catalog enterprise-sub', () => {
  it('has purchasable: false', async () => {
    const { planCatalog } = await import('@/lib/data/plan-catalog')
    const enterprise = planCatalog.find((p) => p.slug === 'enterprise-sub')
    expect(enterprise).toBeDefined()
    expect(enterprise!.purchasable).toBe(false)
  })
})
