import { db } from '@/lib/db'
import { planCatalog } from '@/lib/data/plan-catalog'

export async function ensurePlanCatalog() {
  await Promise.all(
    planCatalog.map((plan) =>
      db.plan.upsert({
        where: { slug: plan.slug },
        update: {
          name: plan.name,
          description: plan.description,
          category: plan.category,
          priceUsd: plan.priceUsd,
          creditsGranted: plan.creditsGranted,
          creditsCost: plan.creditsCost,
          durationDays: plan.durationDays,
          isFeatured: plan.isFeatured ?? false,
          isActive: true,
          features: plan.features,
          meta: plan.meta,
        },
        create: {
          slug: plan.slug,
          name: plan.name,
          description: plan.description,
          category: plan.category,
          priceUsd: plan.priceUsd,
          creditsGranted: plan.creditsGranted,
          creditsCost: plan.creditsCost,
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
