import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { ensurePlanCatalog } from '@/lib/server/plans'
import { serializePlan } from '@/lib/server/serializers'

export async function GET() {
  await ensurePlanCatalog()

  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { priceUsd: 'asc' }],
  })

  return NextResponse.json({ plans: plans.map(serializePlan) })
}
