import { NextResponse } from 'next/server'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeTask } from '@/lib/server/serializers'

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request)
    const tasks = await db.serviceTask.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tasks: tasks.map(serializeTask) })
  } catch (error) {
    return routeErrorResponse(error)
  }
}

// Manual task creation is disabled. Tasks are created automatically when a
// SERVICE_PLAN order is purchased. This prevents unlimited task abuse via
// a single valid order.
export async function POST(request: Request) {
  try {
    await requireSessionUser(request)
    return NextResponse.json(
      { error: 'Tasks are created automatically when you purchase a service plan.' },
      { status: 403 },
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
