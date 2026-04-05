type PlanLike = {
  id: string
  slug: string
  name: string
  description: string
  category: string
  priceUsd: number
  creditsGranted: number | null
  creditsCost: number | null
  durationDays: number | null
  isFeatured: boolean
  features: unknown
}

type UserLike = {
  id: string
  email: string | null
  name: string | null
  role: string
}

type OrderLike = {
  id: string
  status: string
  amountUsd: number
  creditsCost: number
  progress: number
  createdAt: Date
  completedAt: Date | null
  plan: PlanLike
  user?: UserLike | null
}

type RechargeOrderLike = {
  id: string
  credits: number
  amountUsd: number
  status: string
  createdAt: Date
  paidAt: Date | null
  user?: UserLike | null
}

type CreditTransactionLike = {
  id: string
  type: string
  amount: number
  balanceAfter: number
  description: string
  createdAt: Date
}

type SubscriptionLike = {
  id: string
  status: string
  startAt: Date
  endAt: Date
  plan: PlanLike
}

type TaskLike = {
  id: string
  type: string
  status: string
  targetAccount: string
  targetPostUrl: string | null
  note: string | null
  createdAt: Date
  orderId: string | null
}

export function serializePlan(plan: PlanLike) {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    description: plan.description,
    category: plan.category,
    priceUsd: plan.priceUsd,
    creditsGranted: plan.creditsGranted,
    creditsCost: plan.creditsCost,
    durationDays: plan.durationDays,
    isFeatured: plan.isFeatured,
    features: Array.isArray(plan.features) ? plan.features : [],
  }
}

export function serializeOrder(order: OrderLike) {
  return {
    id: order.id,
    status: order.status,
    amountUsd: order.amountUsd,
    creditsCost: order.creditsCost,
    progress: order.progress,
    createdAt: order.createdAt.toISOString(),
    completedAt: order.completedAt?.toISOString() ?? null,
    plan: serializePlan(order.plan),
    user: order.user
      ? {
          id: order.user.id,
          email: order.user.email,
          name: order.user.name,
          role: order.user.role,
        }
      : null,
  }
}

export function serializeRechargeOrder(order: RechargeOrderLike) {
  return {
    id: order.id,
    credits: order.credits,
    amountUsd: order.amountUsd,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    user: order.user
      ? {
          id: order.user.id,
          email: order.user.email,
          name: order.user.name,
          role: order.user.role,
        }
      : null,
  }
}

export function serializeCreditTransaction(transaction: CreditTransactionLike) {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    balanceAfter: transaction.balanceAfter,
    description: transaction.description,
    createdAt: transaction.createdAt.toISOString(),
  }
}

export function serializeSubscription(subscription: SubscriptionLike) {
  return {
    id: subscription.id,
    status: subscription.status,
    startAt: subscription.startAt.toISOString(),
    endAt: subscription.endAt.toISOString(),
    plan: serializePlan(subscription.plan),
  }
}

export function serializeTask(task: TaskLike) {
  return {
    id: task.id,
    type: task.type,
    status: task.status,
    targetAccount: task.targetAccount,
    targetPostUrl: task.targetPostUrl,
    note: task.note,
    createdAt: task.createdAt.toISOString(),
    orderId: task.orderId,
  }
}
