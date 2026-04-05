import { db } from '@/lib/db'

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
    orders,
    rechargeOrders,
    subscriptions,
    transactions,
  }
}
