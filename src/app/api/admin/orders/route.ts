import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/auth/request'
import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'
import { serializeOrder } from '@/lib/server/serializers'

export async function GET(request: Request) {
  try {
    await requireAdminSession(request)
    const orders = await db.order.findMany({
      include: {
        plan: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    type AdminOrderRecord = (typeof orders)[number]

    return NextResponse.json({
      orders: orders.map((order: AdminOrderRecord) => serializeOrder(order)),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
