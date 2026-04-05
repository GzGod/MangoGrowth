import { NextResponse } from 'next/server'

import { requireAdminSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await requireAdminSessionUser(request)
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditBalance: true,
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
