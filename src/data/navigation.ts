import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Layers3,
  Package,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
}

export const primaryNavigation: NavigationItem[] = [
  { label: '仪表盘', path: '/dashboard', icon: BarChart3 },
  { label: '服务', path: '/services', icon: Sparkles },
  { label: '账户增长', path: '/account-growth', icon: TrendingUp },
  { label: '订单', path: '/orders', icon: CalendarDays },
  { label: '账单', path: '/billing', icon: CreditCard },
  { label: '套餐 & 订阅', path: '/plans', icon: Layers3 },
]

export const secondaryNavigation = [{ label: '设置', path: '/settings', icon: Settings }]

export const appIdentity = {
  name: 'GrowthX',
  tagline: 'Powered by SpreadX AI',
  balanceLabel: '积分余额',
  balanceValue: '5,050',
  inviteLabel: '邀请赚积分',
  accountLabel: 'demo@growthx.local',
}

export const packageBadge = {
  icon: Package,
  label: '购买套餐',
}
