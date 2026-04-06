import { NextResponse } from 'next/server'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { getDashboardSnapshot } from '@/lib/server/reports'
import {
  serializeCreditTransaction,
  serializeOrder,
  serializeRechargeOrder,
  serializeSubscription,
} from '@/lib/server/serializers'

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request)
    const snapshot = await getDashboardSnapshot(user.id)
    type DashboardOrderRecord = (typeof snapshot.orders)[number]
    type DashboardRechargeRecord = (typeof snapshot.rechargeOrders)[number]
    type DashboardSubscriptionRecord = (typeof snapshot.subscriptions)[number]
    type DashboardTransactionRecord = (typeof snapshot.transactions)[number]

    return NextResponse.json({
      metrics: {
        balance: snapshot.balance,
        orderCount: snapshot.orderCount,
        spentCredits: snapshot.spentCredits,
      },
      usage: snapshot.usage,
      orders: snapshot.orders.map((order: DashboardOrderRecord) => serializeOrder(order)),
      rechargeOrders: snapshot.rechargeOrders.map((order: DashboardRechargeRecord) => serializeRechargeOrder(order)),
      subscriptions: snapshot.subscriptions.map((subscription: DashboardSubscriptionRecord) => serializeSubscription(subscription)),
      transactions: snapshot.transactions.map((transaction: DashboardTransactionRecord) => serializeCreditTransaction(transaction)),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
