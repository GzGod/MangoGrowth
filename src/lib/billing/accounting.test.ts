import { describe, expect, it } from 'vitest'

import { createRechargeSettlement, createPurchase } from './accounting'

describe('createRechargeSettlement', () => {
  it('marks a recharge as paid and updates the user balance', () => {
    const result = createRechargeSettlement({
      currentBalance: 1200,
      amountUsd: 4900,
      rechargeOrderId: 'recharge_123',
      userId: 'user_123',
    })

    expect(result.nextBalance).toBe(6100)
    expect(result.transaction.amount).toBe(4900)
    expect(result.transaction.type).toBe('RECHARGE')
    expect(result.rechargeOrder.status).toBe('paid')
  })
})

describe('createPurchase', () => {
  it('deducts usd cost and creates an active order when balance is sufficient', () => {
    const result = createPurchase({
      currentBalance: 8000,
      usdCost: 3000,
      amountUsd: 19900,
      orderId: 'order_123',
      planId: 'plan_growth',
      userId: 'user_123',
    })

    expect(result.nextBalance).toBe(5000)
    expect(result.order.status).toBe('active')
    expect(result.transaction.amount).toBe(-3000)
  })

  it('throws an insufficient balance error when balance is too low', () => {
    expect(() =>
      createPurchase({
        currentBalance: 99,
        usdCost: 3000,
        amountUsd: 19900,
        orderId: 'order_123',
        planId: 'plan_growth',
        userId: 'user_123',
      }),
    ).toThrowError('Insufficient balance')
  })
})
