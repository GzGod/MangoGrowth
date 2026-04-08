import type { Prisma } from '@/generated/prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { withX402 } from 'x402-next'
import { generateJwt } from '@coinbase/cdp-sdk/auth'

import { createRechargeSettlement } from '@/lib/billing/accounting'
import { requireSessionUser } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeRechargeOrder } from '@/lib/server/serializers'

type Context = {
  params: Promise<{ id: string }>
}

const PAYMENT_ADDRESS = (process.env.X402_PAYMENT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`
const NETWORK = (process.env.X402_NETWORK ?? 'base-sepolia') as 'base' | 'base-sepolia'
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL ?? 'https://api.cdp.coinbase.com/platform/v2/x402'
const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID
const CDP_API_KEY_SECRET = process.env.CDP_API_KEY_SECRET

async function createCdpAuthHeaders() {
  if (!CDP_API_KEY_ID || !CDP_API_KEY_SECRET) {
    return {
      verify: {} as Record<string, string>,
      settle: {} as Record<string, string>,
      supported: {} as Record<string, string>,
    }
  }
  const verifyJwt = await generateJwt({
    apiKeyId: CDP_API_KEY_ID,
    apiKeySecret: CDP_API_KEY_SECRET,
    requestMethod: 'POST',
    requestHost: 'api.cdp.coinbase.com',
    requestPath: '/platform/v2/x402/verify',
  })
  const settleJwt = await generateJwt({
    apiKeyId: CDP_API_KEY_ID,
    apiKeySecret: CDP_API_KEY_SECRET,
    requestMethod: 'POST',
    requestHost: 'api.cdp.coinbase.com',
    requestPath: '/platform/v2/x402/settle',
  })
  const supportedJwt = await generateJwt({
    apiKeyId: CDP_API_KEY_ID,
    apiKeySecret: CDP_API_KEY_SECRET,
    requestMethod: 'GET',
    requestHost: 'api.cdp.coinbase.com',
    requestPath: '/platform/v2/x402/supported',
  })
  return {
    verify: { Authorization: `Bearer ${verifyJwt}` } as Record<string, string>,
    settle: { Authorization: `Bearer ${settleJwt}` } as Record<string, string>,
    supported: { Authorization: `Bearer ${supportedJwt}` } as Record<string, string>,
  }
}

async function payHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireSessionUser(request)
    const id = request.nextUrl.pathname.split('/').at(-2) ?? ''

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
      // Atomic status transition: only succeeds if status is still PENDING.
      // Concurrent requests will find status already PAID and get count=0.
      const transitioned = await tx.rechargeOrder.updateMany({
        where: { id: rechargeOrder.id, status: 'PENDING' },
        data: { status: 'PAID', paidAt: new Date(), provider: 'x402' },
      })
      if (transitioned.count === 0) {
        throw new Error('Recharge order is not pending')
      }

      await tx.user.update({
        where: { id: user.id },
        data: { usdBalance: { increment: rechargeOrder.amountUsd } },
      })

      // Re-read the committed balance so balanceAfter is exact, not a stale snapshot.
      const { usdBalance: balanceAfter } = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { usdBalance: true },
      })

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: rechargeOrder.amountUsd,
          balanceAfter,
          type: 'RECHARGE',
          description: settlement.transaction.description,
          referenceId: rechargeOrder.id,
        },
      })

      return tx.rechargeOrder.findUniqueOrThrow({ where: { id: rechargeOrder.id } })
    })

    return NextResponse.json({ rechargeOrder: serializeRechargeOrder(updatedOrder) })
  } catch (error) {
    if (error instanceof Error && error.message === 'Recharge order is not pending') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
      price: `$${(priceUsd / 100).toFixed(2)}` as `$${number}`,
      network: NETWORK,
      config: { description: `MangoGrowth 充值 $${(priceUsd / 100).toFixed(2)}` },
    }
  },
  {
    url: FACILITATOR_URL as `${string}://${string}`,
    createAuthHeaders: createCdpAuthHeaders,
  },
)
