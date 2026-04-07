type RechargeSettlementInput = {
  currentBalance: number
  amountUsd: number
  rechargeOrderId: string
  userId: string
}

type PurchaseInput = {
  currentBalance: number
  usdCost: number
  amountUsd: number
  orderId: string
  planId: string
  userId: string
}

export function createRechargeSettlement(input: RechargeSettlementInput) {
  const nextBalance = input.currentBalance + input.amountUsd

  return {
    nextBalance,
    rechargeOrder: {
      id: input.rechargeOrderId,
      userId: input.userId,
      amountUsd: input.amountUsd,
      status: 'paid' as const,
    },
    transaction: {
      userId: input.userId,
      amount: input.amountUsd,
      balanceAfter: nextBalance,
      type: 'RECHARGE' as const,
      referenceId: input.rechargeOrderId,
      description: `Recharge $${(input.amountUsd / 100).toFixed(2)}`,
    },
  }
}

export function createPurchase(input: PurchaseInput) {
  if (input.currentBalance < input.usdCost) {
    throw new Error('Insufficient balance')
  }

  const nextBalance = input.currentBalance - input.usdCost

  return {
    nextBalance,
    order: {
      id: input.orderId,
      userId: input.userId,
      planId: input.planId,
      amountUsd: input.amountUsd,
      usdCost: input.usdCost,
      status: 'active' as const,
    },
    transaction: {
      userId: input.userId,
      amount: -input.usdCost,
      balanceAfter: nextBalance,
      type: 'PURCHASE' as const,
      referenceId: input.orderId,
      description: `Purchase order ${input.orderId}`,
    },
  }
}
