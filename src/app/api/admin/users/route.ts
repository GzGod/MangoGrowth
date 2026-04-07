import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/auth/request'
import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await requireAdminSession(request)
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        usdBalance: true,
        createdAt: true,
      },
    })
    type AdminUserRecord = (typeof users)[number]

    return NextResponse.json({
      users: users.map((user: AdminUserRecord) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
