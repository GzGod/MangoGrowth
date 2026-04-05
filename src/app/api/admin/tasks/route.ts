import { NextResponse } from 'next/server'

import { requireAdminSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeTask } from '@/lib/server/serializers'

export async function GET(request: Request) {
  try {
    await requireAdminSessionUser(request)
    const tasks = await db.serviceTask.findMany({
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    type AdminTaskRecord = (typeof tasks)[number]

    return NextResponse.json({
      tasks: tasks.map((task: AdminTaskRecord) => serializeTask(task)),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
