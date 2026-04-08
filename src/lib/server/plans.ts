import { db } from '@/lib/db'
import { planCatalog } from '@/lib/data/plan-catalog'

export async function ensurePlanCatalog() {
  // Only insert plans that don't exist yet — never overwrite admin changes to
  // price, isActive, or other fields on existing rows.
  await Promise.all(
    planCatalog.map((plan) =>
      db.plan.upsert({
        where: { slug: plan.slug },
        update: {}, // no-op: preserve any admin edits
        create: {
          slug: plan.slug,
          name: plan.name,
          description: plan.description,
          category: plan.category,
          priceUsd: plan.priceUsd,
          usdCost: plan.usdCost,
          durationDays: plan.durationDays,
          isFeatured: plan.isFeatured ?? false,
          isActive: true,
          features: plan.features,
          meta: plan.meta,
        },
      }),
    ),
  )
}
