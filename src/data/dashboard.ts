import { ArrowUpRight, CirclePlus, Coins, Package, Sparkles } from 'lucide-react'

export const onboardingCards = [
  {
    step: 'STEP 1',
    title: '充值获取平台积分',
    description: '充值积分，获取平台份额，开启您的增长之旅',
    icon: Coins,
  },
  {
    step: 'STEP 2',
    title: '启动增长',
    description: '消耗积分，增长粉丝、互动量，提高账号影响力',
    icon: Sparkles,
  },
]

export const overviewMetrics = [
  { label: '我的积分', value: '5,050', icon: CirclePlus },
  { label: '订单总数', value: '1', icon: ArrowUpRight },
  { label: '花费积分总数', value: '1,000', icon: ArrowUpRight },
]

export const dashboardUsageRanges = [
  { id: '7d', label: '最近7天' },
  { id: '30d', label: '最近30天' },
  { id: '90d', label: '最近3个月' },
]

export const dashboardUsageByRange = {
  '7d': [
    { label: 'Mar 31', value: 0 },
    { label: 'Apr 1', value: 1000 },
    { label: 'Apr 2', value: 0 },
    { label: 'Apr 3', value: 0 },
    { label: 'Apr 4', value: 0 },
    { label: 'Apr 5', value: 0 },
    { label: 'Apr 6', value: 0 },
  ],
  '30d': [
    { label: 'Week 1', value: 1000 },
    { label: 'Week 2', value: 0 },
    { label: 'Week 3', value: 0 },
    { label: 'Week 4', value: 0 },
  ],
  '90d': [
    { label: 'Jan', value: 0 },
    { label: 'Feb', value: 0 },
    { label: 'Mar', value: 0 },
    { label: 'Apr', value: 1000 },
  ],
} as const

export const recentOrders = [
  {
    id: 'b6415002bfcf44458ec69f564c9742d7',
    status: '执行中',
    name: '[standard] Follow @Xuegaogx x100',
    createdAt: '2026年4月1日 22:47:57',
    progress: '99% (99/100)',
    credits: '1000',
    remainingTime: '0',
  },
]

export const quotaEmptyState = {
  icon: Package,
  title: '您还没有激活的套餐',
  description: '激活后即可使用配额能力，并在此处查看消费情况。',
  actionLabel: '购买套餐',
}
