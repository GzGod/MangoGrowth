import { db } from '@/lib/db'

type UsageTransaction = {
  createdAt: Date
  amount: number
}

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function formatUsageLabel(day: number) {
  const date = new Date(day)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function buildUsageSeries(transactions: UsageTransaction[], days: number, now = new Date()) {
  const buckets = new Map<number, number>()

  for (const transaction of transactions) {
    if (transaction.amount >= 0) {
      continue
    }

    const key = startOfUtcDay(transaction.createdAt)
    buckets.set(key, (buckets.get(key) ?? 0) + Math.abs(transaction.amount))
  }

  const end = startOfUtcDay(now)
  const series = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = end - offset * 24 * 60 * 60 * 1000
    series.push({
      date: formatUsageLabel(day),
      credits: buckets.get(day) ?? 0,
    })
  }

  return series
}

export async function getDashboardSnapshot(userId: string) {
  const [user, orders, rechargeOrders, subscriptions, transactions] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        creditBalance: true,
      },
    }),
    db.order.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.rechargeOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.subscription.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])
  type TransactionRecord = (typeof transactions)[number]

  const spentCredits = transactions
    .filter((transaction: TransactionRecord) => transaction.amount < 0)
    .reduce((sum: number, transaction: TransactionRecord) => sum + Math.abs(transaction.amount), 0)

  return {
    balance: user.creditBalance,
    orderCount: orders.length,
    spentCredits,
    usage: {
      last7: buildUsageSeries(transactions, 7),
      last30: buildUsageSeries(transactions, 30),
      last90: buildUsageSeries(transactions, 90),
    },
    orders,
    rechargeOrders,
    subscriptions,
    transactions,
  }
}
