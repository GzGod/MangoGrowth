# MangoGrowth

MangoGrowth 现在已经从纯前端原型升级成 `Next.js + Privy + Prisma` 的全栈控制台。

当前版本包含：

- Privy 登录 / 注册接入
- 用户本地资料与角色映射
- 积分充值订单
- 套餐 / 订阅下单
- 服务任务创建与列表
- 管理员查看用户、订单、充值单、任务
- 更贴近原截图的控制台 UI，并修正了品牌区过大、logo 溢出的问题

## Stack

- Next.js App Router
- React 19
- TypeScript
- Privy React Auth
- Prisma
- PostgreSQL
- Recharts
- Vitest

## Environment

参考 [`.env.example`](/e:/vibe/MangoGrowth/.env.example)：

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mangogrowth?schema=public
BOOTSTRAP_ADMIN_EMAILS=admin@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`BOOTSTRAP_ADMIN_EMAILS` 中的邮箱会在首次通过 Privy 登录后自动获得管理员权限。

## Run locally

```bash
npm install
npx prisma generate
npm run dev
```

如果你已经有 PostgreSQL，可继续执行：

```bash
npx prisma db push
```

## Verification

```bash
npm ci
npm run test
npm run lint
npm run build
```

## Notes

- 真实支付网关还没有接入，目前充值使用“创建充值单 + 模拟支付到账”流程。
- 服务任务系统只做通用 SaaS 任务记录和后台流转展示，不包含真实外部执行引擎。
- 当前本地 `.env.local` 已接入你提供的 Privy `app id` 和 `app secret`，不会进入 git。
