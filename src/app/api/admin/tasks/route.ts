import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/auth/request'
import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'
import { serializeTask } from '@/lib/server/serializers'

export async function GET(request: Request) {
  try {
    await requireAdminSession(request)
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
