import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'
import { serializePlan } from '@/lib/server/serializers'

const planSchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  category: z.enum(['SERVICE_PLAN', 'SUBSCRIPTION_PLAN', 'CREDIT_PACK']),
  priceUsd: z.number().int().min(0),
  usdCost: z.number().int().min(0).optional(),
  durationDays: z.number().int().min(1).optional(),
  isFeatured: z.boolean().optional(),
  features: z.array(z.string()),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request)
    const plans = await db.plan.findMany({
      orderBy: [{ category: 'asc' }, { priceUsd: 'asc' }],
    })
    return NextResponse.json({ plans: plans.map(serializePlan) })
  } catch (error) {
    if (error instanceof Response) return error
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(request)
    const parsed = planSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const data = parsed.data
    const plan = await db.plan.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        category: data.category,
        priceUsd: data.priceUsd,
        usdCost: data.usdCost,
        durationDays: data.durationDays,
        isFeatured: data.isFeatured ?? false,
        isActive: true,
        features: data.features,
      },
    })
    return NextResponse.json({ plan: serializePlan(plan) }, { status: 201 })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('[admin/plans POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
