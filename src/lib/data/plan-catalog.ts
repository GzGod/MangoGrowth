export type PlanSeed = {
  slug: string
  name: string
  description: string
  category: 'SERVICE_PLAN' | 'SUBSCRIPTION_PLAN'
  priceUsd: number
  usdCost?: number
  durationDays?: number
  isFeatured?: boolean
  /** If false, the plan cannot be purchased directly (e.g. contact-sales / enterprise) */
  purchasable?: boolean
  features: string[]
  meta?: Record<string, string | number | boolean>
}

export const planCatalog: PlanSeed[] = [
  // 服务套餐（一次性购买，固定服务量）
  {
    slug: 'trial-pack',
    name: '体验包 (Trial)',
    description: '适合第一次使用，低成本体验真实互动与增长节奏。',
    category: 'SERVICE_PLAN',
    priceUsd: 9,
    usdCost: 9,
    isFeatured: false,
    features: ['关注 50', '点赞 20', '转发 10', '评论 5', '收藏 5'],
  },
  {
    slug: 'growth-pack',
    name: '增长包 (Growth)',
    description: '适合刚建立账号或已有少量关注度，开始系统化增长。',
    category: 'SERVICE_PLAN',
    priceUsd: 149,
    usdCost: 149,
    isFeatured: false,
    features: ['关注 1,000', '点赞 500', '转发 100', '评论 50', '收藏 50'],
  },
  {
    slug: 'momentum-pack',
    name: '动能包 (Momentum)',
    description: '适合已经有一定关注度，希望显著放大内容互动与传播效果的账号。',
    category: 'SERVICE_PLAN',
    priceUsd: 599,
    usdCost: 599,
    isFeatured: true,
    features: ['关注 3,000', '点赞 1,200', '转发 400', '评论 200', '收藏 200'],
  },
  {
    slug: 'scale-pack',
    name: '规模增长包 (Scale)',
    description: '适合项目方、KOL 团队，用于规模化放大账号影响力。',
    category: 'SERVICE_PLAN',
    priceUsd: 1899,
    usdCost: 1899,
    isFeatured: false,
    features: ['关注 10,000', '点赞 2,000', '转发 1,000', '评论 500', '收藏 500'],
  },
  // 订阅套餐（按月自动化增长）
  {
    slug: 'starter-sub',
    name: '入门自动化增长',
    description: '适合个人创作者和早期账号。每天最多 2 条推文；轻量自动互动，帮助内容获得基础曝光。',
    category: 'SUBSCRIPTION_PLAN',
    priceUsd: 199,
    usdCost: 199,
    durationDays: 30,
    isFeatured: false,
    features: ['点赞 20-30', '评论 3-5', '转发 5-8', '收藏 3-5'],
  },
  {
    slug: 'growth-sub',
    name: '中早期自动化增长',
    description: '适合持续输出内容的创作者。每天最多 3 条推文；为每一条内容提供稳定的互动基础。',
    category: 'SUBSCRIPTION_PLAN',
    priceUsd: 599,
    usdCost: 599,
    durationDays: 30,
    isFeatured: false,
    features: ['点赞 50-80', '评论 4-8', '转发 10-20', '收藏 10-20'],
  },
  {
    slug: 'pro-sub',
    name: '专业自动化增长',
    description: '适合 KOL 和项目方官方账号。每天最多 5 条推文；用于发布期、活动期和故事放大。',
    category: 'SUBSCRIPTION_PLAN',
    priceUsd: 2499,
    usdCost: 2499,
    durationDays: 30,
    isFeatured: false,
    features: ['点赞 200-300', '评论 5-15', '转发 30-50', '收藏 30-50'],
  },
  {
    slug: 'enterprise-sub',
    name: '企业版',
    description: '适合规模化运营团队，为您量身定制价格方案。',
    category: 'SUBSCRIPTION_PLAN',
    priceUsd: 0,
    usdCost: 0,
    durationDays: 30,
    isFeatured: false,
    purchasable: false,
    features: [],
  },
]
