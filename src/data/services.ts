import {
  Bookmark,
  Heart,
  MessageCircle,
  Quote,
  Repeat2,
  UserPlus,
} from 'lucide-react'

export const servicesNotice =
  'SpreadX 的所有增长行为，都由真实的加密用户执行，AI 只负责协调，而不是造假。'

export const serviceCards = [
  {
    title: '关注',
    description: '用真实的加密原生粉丝增长你的账号。所有粉丝都拥有真实资料和长期行为的活跃用户。',
    icon: UserPlus,
  },
  {
    title: '点赞',
    description: '获得真实加密用户的点赞，每个点赞都来自真实账号，推动早期热度和社交认证。',
    icon: Heart,
  },
  {
    title: '转发',
    description: '通过有机传播扩大影响力，内容流过真实加密时间线传播，而非机器人网络。',
    icon: Repeat2,
  },
  {
    title: '评论',
    description: '生成高质量、贴合语境的讨论，让评论更匹配你的帖子并受众文化。',
    icon: MessageCircle,
  },
  {
    title: '收藏',
    description: '增加来自真实用户的收藏，收藏代表长期兴趣，而非噪音。',
    icon: Bookmark,
  },
  {
    title: '引用',
    description: '引用真实加密推文，引用会匹配你的帖子、受众和加密文化。',
    icon: Quote,
  },
]
