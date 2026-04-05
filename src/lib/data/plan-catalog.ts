export type PlanSeed = {
  slug: string
  name: string
  description: string
  category: 'CREDIT_PACK' | 'SERVICE_PLAN' | 'SUBSCRIPTION_PLAN'
  priceUsd: number
  creditsGranted?: number
  creditsCost?: number
  durationDays?: number
  isFeatured?: boolean
  features: string[]
  meta?: Record<string, string | number | boolean>
}

export const planCatalog: PlanSeed[] = [
  {
    slug: 'starter-credits',
    name: '10,500 积分',
    description: '适合首次充值和轻量启动，用于试单和短期验证。',
    category: 'CREDIT_PACK',
    priceUsd: 100,
    creditsGranted: 10500,
    features: ['即时到账', '可用于服务购买', '支付接口已预留'],
  },
  {
    slug: 'growth-credits',
    name: '51,500 积分',
    description: '适合稳定运营的团队，覆盖更长周期的订阅与服务购买。',
    category: 'CREDIT_PACK',
    priceUsd: 500,
    creditsGranted: 51500,
    isFeatured: true,
    features: ['额外奖励 1,500 积分', '适合月度使用', '可解锁高级套餐'],
  },
  {
    slug: 'momentum-service',
    name: '动能包',
    description: '面向已经有一定基础内容的账号，放大单条内容的互动表现。',
    category: 'SERVICE_PLAN',
    priceUsd: 499,
    creditsCost: 3000,
    features: ['关注 3,000', '点赞 1,200', '评论 200', '引用 200'],
  },
  {
    slug: 'pro-subscription',
    name: '专业自动化增长',
    description: '适合 KOL 和项目方官方账号的长期自动化运营套餐。',
    category: 'SUBSCRIPTION_PLAN',
    priceUsd: 2499,
    creditsCost: 12000,
    durationDays: 30,
    isFeatured: true,
    features: ['点赞 200-300 / 天', '评论 5-15 / 天', '转发 30-50 / 天', '收藏 30-50 / 天'],
  },
]
