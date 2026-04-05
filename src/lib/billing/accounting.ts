type RechargeSettlementInput = {
  currentBalance: number
  credits: number
  amountUsd: number
  rechargeOrderId: string
  userId: string
}

type SubscriptionPurchaseInput = {
  currentBalance: number
  creditsCost: number
  amountUsd: number
  orderId: string
  planId: string
  userId: string
}

export function createRechargeSettlement(input: RechargeSettlementInput) {
  const nextBalance = input.currentBalance + input.credits

  return {
    nextBalance,
    rechargeOrder: {
      id: input.rechargeOrderId,
      userId: input.userId,
      credits: input.credits,
      amountUsd: input.amountUsd,
      status: 'paid' as const,
    },
    transaction: {
      userId: input.userId,
      amount: input.credits,
      balanceAfter: nextBalance,
      type: 'recharge' as const,
      referenceId: input.rechargeOrderId,
    },
  }
}

export function createSubscriptionPurchase(input: SubscriptionPurchaseInput) {
  if (input.currentBalance < input.creditsCost) {
    throw new Error('Insufficient credits')
  }

  const nextBalance = input.currentBalance - input.creditsCost

  return {
    nextBalance,
    order: {
      id: input.orderId,
      userId: input.userId,
      planId: input.planId,
      amountUsd: input.amountUsd,
      creditsCost: input.creditsCost,
      status: 'active' as const,
    },
    transaction: {
      userId: input.userId,
      amount: -input.creditsCost,
      balanceAfter: nextBalance,
      type: 'purchase' as const,
      referenceId: input.orderId,
    },
  }
}
