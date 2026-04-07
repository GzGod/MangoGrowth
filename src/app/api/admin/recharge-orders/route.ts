import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/auth/request'
import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'
import { serializeRechargeOrder } from '@/lib/server/serializers'

export async function GET(request: Request) {
  try {
    await requireAdminSession(request)
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
