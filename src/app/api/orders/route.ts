import type { Prisma } from '@/generated/prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createSubscriptionPurchase } from '@/lib/billing/accounting'
import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { ensurePlanCatalog } from '@/lib/server/plans'
import { serializeOrder } from '@/lib/server/serializers'

const orderSchema = z.object({
  planSlug: z.string().min(1).max(100),
})

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request)
    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })
    type UserOrderRecord = (typeof orders)[number]

    return NextResponse.json({
      orders: orders.map((order: UserOrderRecord) => serializeOrder(order)),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    await ensurePlanCatalog()
    const user = await requireSessionUser(request)
    const parsed = orderSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const { planSlug } = parsed.data

    const plan = await db.plan.findUnique({
      where: { slug: planSlug },
    })

    if (!plan || !plan.creditsCost) {
      return NextResponse.json({ error: 'Plan is not purchasable with credits' }, { status: 400 })
    }

    const creditsCost = plan.creditsCost

    const settlement = createSubscriptionPurchase({
      currentBalance: user.creditBalance,
      creditsCost,
      amountUsd: plan.priceUsd,
      orderId: crypto.randomUUID(),
      planId: plan.id,
      userId: user.id,
    })

    const order = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          creditBalance: settlement.nextBalance,
        },
      })

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: settlement.transaction.amount,
          balanceAfter: settlement.transaction.balanceAfter,
          type: 'PURCHASE',
          description: `购买 ${plan.name}`,
          referenceId: settlement.order.id,
        },
      })

      const createdOrder = await tx.order.create({
        data: {
          id: settlement.order.id,
          userId: user.id,
          planId: plan.id,
          type: plan.category === 'SUBSCRIPTION_PLAN' ? 'SUBSCRIPTION_PURCHASE' : 'SERVICE_PURCHASE',
          status: 'ACTIVE',
          amountUsd: plan.priceUsd,
          creditsCost,
          progress: plan.category === 'SERVICE_PLAN' ? 99 : 100,
          completedAt: plan.category === 'SERVICE_PLAN' ? null : new Date(),
        },
        include: { plan: true },
      })

      if (plan.category === 'SUBSCRIPTION_PLAN' && plan.durationDays) {
        await tx.subscription.create({
          data: {
            userId: user.id,
            planId: plan.id,
            status: 'ACTIVE',
            endAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
          },
        })
      }

      if (plan.category === 'SERVICE_PLAN') {
        await tx.serviceTask.create({
          data: {
            userId: user.id,
            orderId: settlement.order.id,
            type: 'FOLLOW',
            status: 'QUEUED',
            targetAccount: '@mango_growth_demo',
            note: '系统默认任务，用于演示服务创建后的任务流转。',
          },
        })
      }

      return createdOrder
    })

    return NextResponse.json({ order: serializeOrder(order) }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient credits') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return routeErrorResponse(error)
  }
}
