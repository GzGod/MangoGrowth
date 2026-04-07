import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeRechargeOrder } from '@/lib/server/serializers'

const rechargeSchema = z.object({
  credits: z.number().int().positive().max(10_000_000),
  amountUsd: z.number().int().positive().max(100_000),
})

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request)
    const orders = await db.rechargeOrder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    type RechargeOrderRecord = (typeof orders)[number]

    return NextResponse.json({
      rechargeOrders: orders.map((order: RechargeOrderRecord) => serializeRechargeOrder(order)),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser(request)
    const parsed = rechargeSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const { credits, amountUsd } = parsed.data

    const order = await db.rechargeOrder.create({
      data: {
        userId: user.id,
        credits,
        amountUsd,
        status: 'PENDING',
        provider: 'x402',
      },
    })

    return NextResponse.json({ rechargeOrder: serializeRechargeOrder(order) }, { status: 201 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
