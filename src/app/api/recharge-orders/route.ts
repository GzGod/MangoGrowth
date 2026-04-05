import { NextResponse } from 'next/server'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeRechargeOrder } from '@/lib/server/serializers'

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
    const body = (await request.json()) as { credits?: number; amountUsd?: number }

    if (!body.credits || !body.amountUsd) {
      return NextResponse.json({ error: 'Missing recharge amount' }, { status: 400 })
    }

    const order = await db.rechargeOrder.create({
      data: {
        userId: user.id,
        credits: body.credits,
        amountUsd: body.amountUsd,
        status: 'PENDING',
        provider: 'placeholder',
      },
    })

    return NextResponse.json({ rechargeOrder: serializeRechargeOrder(order) }, { status: 201 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
