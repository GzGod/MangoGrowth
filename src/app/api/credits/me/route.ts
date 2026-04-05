import { NextResponse } from 'next/server'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request)
    return NextResponse.json({
      balance: user.creditBalance,
      role: user.role,
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
