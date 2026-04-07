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
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...serializeOrder(order),
        type: order.type,
        tasks: order.tasks.map((task) => ({
          id: task.id,
          type: task.type,
          status: task.status,
          targetAccount: task.targetAccount,
          targetPostUrl: task.targetPostUrl,
          note: task.note,
          createdAt: task.createdAt.toISOString(),
        })),
      })),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
