import type { Metadata } from 'next'

import { AppProviders } from '@/components/providers/app-providers'

import './globals.css'

export const metadata: Metadata = {
  title: 'MangoGrowth',
  description: 'MangoGrowth 全栈控制台，集成 Privy 登录、积分充值、套餐购买与管理员订单视图。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
