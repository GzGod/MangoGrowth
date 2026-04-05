import { NextResponse } from 'next/server'

import { requireAdminSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeRechargeOrder } from '@/lib/server/serializers'

export async function GET(request: Request) {
  try {
    await requireAdminSessionUser(request)
    const rechargeOrders = await db.rechargeOrder.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    type AdminRechargeOrderRecord = (typeof rechargeOrders)[number]

    return NextResponse.json({
      rechargeOrders: rechargeOrders.map((order: AdminRechargeOrderRecord) => serializeRechargeOrder(order)),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
