import { describe, expect, it } from 'vitest'

import { createRechargeSettlement, createSubscriptionPurchase } from './accounting'

describe('createRechargeSettlement', () => {
  it('marks a recharge as paid and updates the user balance', () => {
    const result = createRechargeSettlement({
      currentBalance: 1200,
      credits: 5000,
      amountUsd: 49,
      rechargeOrderId: 'recharge_123',
      userId: 'user_123',
    })

    expect(result.nextBalance).toBe(6200)
    expect(result.transaction.amount).toBe(5000)
    expect(result.transaction.type).toBe('recharge')
    expect(result.rechargeOrder.status).toBe('paid')
  })
})

describe('createSubscriptionPurchase', () => {
  it('deducts credits and creates an active paid order when balance is sufficient', () => {
    const result = createSubscriptionPurchase({
      currentBalance: 8000,
      creditsCost: 3000,
      amountUsd: 199,
      orderId: 'order_123',
      planId: 'plan_growth',
      userId: 'user_123',
    })

    expect(result.nextBalance).toBe(5000)
    expect(result.order.status).toBe('active')
    expect(result.transaction.amount).toBe(-3000)
  })

  it('throws an insufficient balance error when credits are too low', () => {
    expect(() =>
      createSubscriptionPurchase({
        currentBalance: 99,
        creditsCost: 3000,
        amountUsd: 199,
        orderId: 'order_123',
        planId: 'plan_growth',
        userId: 'user_123',
      }),
    ).toThrowError('Insufficient credits')
  })
})
