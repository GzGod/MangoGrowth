import { BadgeCheck, Bot, ShieldCheck, WalletCards } from 'lucide-react'

export const growthHighlights = [
  {
    title: '真实账号',
    description: '所有互动均来自经过验证的真实推特账号，拥有真实活动历史。',
    icon: BadgeCheck,
  },
  {
    title: '自动互动',
    description: '每条新推自动获得指定范围内的保真关注数和点赞数。',
    icon: Bot,
  },
  {
    title: '矩阵增长',
    description: '多个账号协同工作，打造有机的病毒式增长效果。',
    icon: ShieldCheck,
  },
]

export const billingProfile = {
  email: 'demo@growthx.local',
  uid: 'UID: 0B3C8D255AF6450D9E411F9C85ED1DDE',
}

export const paymentOrders = [
  { id: 'recharge-demo-01', type: '充值', packageName: '积分充值', subscription: '-', amount: '$50' },
  { id: 'plan-demo-01', type: '套餐', packageName: 'Growth', subscription: '-', amount: '$129' },
  { id: 'sub-demo-01', type: '订阅', packageName: '-', subscription: '入门自动化增长', amount: '$199/月' },
]

export const billingUsageByRange = {
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

export const subscriptionEmptyState = {
  icon: WalletCards,
  title: '您还没有订阅方案',
  description: '订阅后即可巧妙控制增长率，每条新推自动获得真实关注与点赞。',
  actionLabel: '立即订阅',
}
