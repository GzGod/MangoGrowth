import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'
import { serializePlan } from '@/lib/server/serializers'

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  priceUsd: z.number().int().min(0).optional(),
  creditsCost: z.number().int().min(0).optional(),
  creditsGranted: z.number().int().min(0).optional(),
  durationDays: z.number().int().min(1).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  features: z.array(z.string()).optional(),
})

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAdminSession(request)
    const { id } = await context.params
    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const plan = await db.plan.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json({ plan: serializePlan(plan) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requireAdminSession(_request)
    const { id } = await context.params
    await db.plan.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
