import type { Prisma } from '@/generated/prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { withX402 } from 'x402-next'

import { createRechargeSettlement } from '@/lib/billing/accounting'
import { requireSessionUser } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeRechargeOrder } from '@/lib/server/serializers'

type Context = {
  params: Promise<{ id: string }>
}

const PAYMENT_ADDRESS = (process.env.X402_PAYMENT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`
const NETWORK = (process.env.X402_NETWORK ?? 'base-sepolia') as 'base' | 'base-sepolia'
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL

async function payHandler(request: NextRequest, context: Context): Promise<NextResponse> {
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
      currentBalance: user.usdBalance,
      amountUsd: rechargeOrder.amountUsd,
      rechargeOrderId: rechargeOrder.id,
      userId: user.id,
    })

    const updatedOrder = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: user.id },
        data: { usdBalance: settlement.nextBalance },
      })

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: settlement.transaction.amount,
          balanceAfter: settlement.transaction.balanceAfter,
          type: 'RECHARGE',
          description: settlement.transaction.description,
          referenceId: rechargeOrder.id,
        },
      })

      return tx.rechargeOrder.update({
        where: { id: rechargeOrder.id },
        data: { status: 'PAID', paidAt: new Date(), provider: 'x402' },
      })
    })

    return NextResponse.json({ rechargeOrder: serializeRechargeOrder(updatedOrder) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const POST = withX402(
  payHandler as (request: NextRequest) => Promise<NextResponse>,
  PAYMENT_ADDRESS,
  async (req: NextRequest) => {
    const id = req.nextUrl.pathname.split('/').at(-2) ?? ''
    const order = await db.rechargeOrder.findFirst({ where: { id } })
    const priceUsd = order?.amountUsd ?? 1
    return {
      price: `$${priceUsd}` as `$${number}`,
      network: NETWORK,
      config: { description: `MangoGrowth 充值 $${(priceUsd / 100).toFixed(2)}` },
    }
  },
  FACILITATOR_URL ? { url: FACILITATOR_URL as `${string}://${string}` } : undefined,
)
