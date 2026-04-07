import { NextResponse } from 'next/server'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { getDashboardSnapshot } from '@/lib/server/reports'
import {
  serializeTransaction,
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
        spentUsd: snapshot.spentUsd,
      },
      usage: snapshot.usage,
      orders: snapshot.orders.map((order: DashboardOrderRecord) => serializeOrder(order)),
      rechargeOrders: snapshot.rechargeOrders.map((order: DashboardRechargeRecord) => serializeRechargeOrder(order)),
      subscriptions: snapshot.subscriptions.map((sub: DashboardSubscriptionRecord) => serializeSubscription(sub)),
      transactions: snapshot.transactions.map((t: DashboardTransactionRecord) => serializeTransaction(t)),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
