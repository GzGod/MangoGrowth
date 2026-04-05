import type { Prisma } from '@/generated/prisma/client'
import { NextResponse } from 'next/server'

import { createRechargeSettlement } from '@/lib/billing/accounting'
import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeRechargeOrder } from '@/lib/server/serializers'

type Context = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: Context) {
  try {
    const user = await requireSessionUser(request)
    const { id } = await context.params
    const rechargeOrder = await db.rechargeOrder.findFirst({
      where: { id, userId: user.id },
    })

    if (!rechargeOrder) {
      return NextResponse.json({ error: 'Recharge order not found' }, { status: 404 })
    }

    if (rechargeOrder.status !== 'PENDING') {
      return NextResponse.json({ error: 'Recharge order is not pending' }, { status: 400 })
    }

    const settlement = createRechargeSettlement({
      currentBalance: user.creditBalance,
      credits: rechargeOrder.credits,
      amountUsd: rechargeOrder.amountUsd,
      rechargeOrderId: rechargeOrder.id,
      userId: user.id,
    })

    const updatedOrder = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: user.id },
        data: { creditBalance: settlement.nextBalance },
      })

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: settlement.transaction.amount,
          balanceAfter: settlement.transaction.balanceAfter,
          type: 'RECHARGE',
          description: `充值 ${rechargeOrder.credits} 积分`,
          referenceId: rechargeOrder.id,
        },
      })

      return tx.rechargeOrder.update({
        where: { id: rechargeOrder.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      })
    })

    return NextResponse.json({ rechargeOrder: serializeRechargeOrder(updatedOrder) })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
