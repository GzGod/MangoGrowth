import { Bookmark, Heart, MessageCircle, Quote, Repeat2, UserPlus } from 'lucide-react'

export const servicePlans = [
  {
    name: '体验包 (Trial)',
    price: '$8',
    originalPrice: '$10',
    description: '适合第一次使用，低成本体验真实互动与增长节奏。',
    actionLabel: '立即购买',
    features: [
      { icon: UserPlus, label: '关注', value: '50' },
      { icon: Heart, label: '点赞', value: '20' },
      { icon: Repeat2, label: '转发', value: '10' },
      { icon: MessageCircle, label: '评论', value: '5' },
      { icon: Bookmark, label: '收藏', value: '5' },
    ],
  },
  {
    name: '增长包 (Growth)',
    price: '$129',
    originalPrice: '$180',
    description: '适合刚建立账号或已有少量关注度，开始系统化增长。',
    actionLabel: '立即购买',
    features: [
      { icon: UserPlus, label: '关注', value: '1,000' },
      { icon: Heart, label: '点赞', value: '500' },
      { icon: Repeat2, label: '转发', value: '100' },
      { icon: MessageCircle, label: '评论', value: '50' },
      { icon: Bookmark, label: '收藏', value: '50' },
    ],
  },
  {
    name: '动能包 (Momentum)',
    price: '$499',
    originalPrice: '$740',
    description: '适合已经有一定关注度，希望显著放大内容互动与传播效果的账号。',
    actionLabel: '立即购买',
    featured: true,
    badge: '热门',
    features: [
      { icon: UserPlus, label: '关注', value: '3,000' },
      { icon: Heart, label: '点赞', value: '1,200' },
      { icon: Repeat2, label: '转发', value: '400' },
      { icon: MessageCircle, label: '评论', value: '200' },
      { icon: Bookmark, label: '收藏', value: '200' },
      { icon: Quote, label: '引用', value: '200' },
    ],
  },
  {
    name: '规模增长包 (Scale)',
    price: '$1,699',
    originalPrice: '$3,150',
    description: '适合项目方、KOL、团队，用于规模化放大账号影响力。',
    actionLabel: '立即购买',
    features: [
      { icon: UserPlus, label: '关注', value: '10,000' },
      { icon: Heart, label: '点赞', value: '2,000' },
      { icon: Repeat2, label: '转发', value: '1,000' },
      { icon: MessageCircle, label: '评论', value: '500' },
      { icon: Bookmark, label: '收藏', value: '500' },
    ],
  },
]

export const subscriptionPlans = [
  {
    name: '入门自动化增长',
    price: '$199',
    unit: '/月',
    description: '适合个人创作者和早期账号。每天最多 2 条推文，轻量自动互动。',
    actionLabel: '订阅',
    ranges: [
      { icon: Heart, label: '点赞', value: '20-30' },
      { icon: MessageCircle, label: '评论', value: '3-5' },
      { icon: Repeat2, label: '转发', value: '5-8' },
      { icon: Bookmark, label: '收藏', value: '3-5' },
    ],
  },
  {
    name: '中早期自动化增长',
    price: '$599',
    unit: '/月',
    description: '适合持续输出内容的创作者。每天最多 3 条推文，提供稳定互动基础。',
    actionLabel: '订阅',
    ranges: [
      { icon: Heart, label: '点赞', value: '50-80' },
      { icon: MessageCircle, label: '评论', value: '4-8' },
      { icon: Repeat2, label: '转发', value: '10-20' },
      { icon: Bookmark, label: '收藏', value: '10-20' },
    ],
  },
  {
    name: '专业自动化增长',
    price: '$2499',
    unit: '/月',
    description: '适合 KOL 和项目官方账号。每天最多 5 条推文，用于发布期放大。',
    actionLabel: '订阅',
    ranges: [
      { icon: Heart, label: '点赞', value: '200-300' },
      { icon: MessageCircle, label: '评论', value: '5-15' },
      { icon: Repeat2, label: '转发', value: '30-50' },
      { icon: Bookmark, label: '收藏', value: '30-50' },
    ],
  },
  {
    name: '企业版',
    price: '自定义',
    unit: '',
    description: '适合规模化运营团队，为您量身定制价格方案。',
    actionLabel: '联系我们',
    ranges: [],
  },
]

export const creditBundles = [
  { label: '10 积分', price: '$0.1' },
  { label: '100 积分', price: '$1' },
  { label: '1,000 积分', price: '$10' },
  { label: '5,050 积分', price: '$50', bonus: '含 50 奖励' },
  { label: '10,500 积分', price: '$100', bonus: '含 500 奖励' },
  { label: '51,500 积分', price: '$500', bonus: '含 1,500 奖励' },
  { label: '105,000 积分', price: '$1,000', bonus: '含 5,000 奖励' },
]
