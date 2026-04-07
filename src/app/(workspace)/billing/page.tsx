'use client'

import { CircleDollarSign, Copy, CreditCard, UserRound, Wallet, WalletCards, X } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { useConnectWallet, useWallets, useX402Fetch } from '@privy-io/react-auth'

import { UsageChart } from '@/components/charts/usage-chart'
import { useSession } from '@/components/providers/session-provider'
import { EmptyState, Panel, PrimaryButton, SecondaryButton, StatCard, StatusPill, TableShell } from '@/components/ui/surface'
import { useApiQuery } from '@/hooks/use-api-query'
import { resolveDisplayIdentity } from '@/lib/auth/identity'
import { usageRanges } from '@/lib/data/dashboard'

type UsageRangeKey = (typeof usageRanges)[number]['key']
type PaymentTab = 'recharge' | 'package' | 'subscription'

type DashboardResponse = {
  metrics: {
    balance: number
    orderCount: number
    spentUsd: number
  }
  usage: Record<UsageRangeKey, Array<{ date: string; usd: number }>>
  rechargeOrders: Array<{
    id: string
    amountUsd: number
    status: string
    createdAt: string
  }>
  transactions: Array<{
    id: string
    type: string
    amount: number
    balanceAfter: number
    description: string
    createdAt: string
  }>
}

const RECHARGE_OPTIONS = [
  { label: '$100', amountUsd: 10000 },
  { label: '$500', amountUsd: 50000 },
  { label: '$1000', amountUsd: 100000 },
]

// USDC 合约地址（base-sepolia 测试网）
const USDC_ADDRESS_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
const USDC_ADDRESS_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const USDC_ABI = [{ inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }] as const

const paymentTabs: Array<{ key: PaymentTab; label: string }> = [
  { key: 'recharge', label: '充值' },
  { key: 'package', label: '套餐' },
  { key: 'subscription', label: '订阅' },
]

export default function BillingPage() {
  const { user, authIdentity, isAuthenticated, identityToken, refreshSession } = useSession()
  const { data, refetch } = useApiQuery<DashboardResponse>('/api/dashboard')
  const { wallets } = useWallets()
  const { connectWallet } = useConnectWallet()
  const { wrapFetchWithPayment } = useX402Fetch()
  const [activeRange, setActiveRange] = useState<UsageRangeKey>('last7')
  const [activePaymentTab, setActivePaymentTab] = useState<PaymentTab>('recharge')
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<(typeof RECHARGE_OPTIONS)[number] | null>(null)
  const [rechargeStatus, setRechargeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [rechargeError, setRechargeError] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null)

  // 优先用外部钱包（MetaMask 等），没有再用 Privy 内嵌钱包
  const activeWallet = wallets.find((w) => w.walletClientType !== 'privy') ?? wallets.find((w) => w.walletClientType === 'privy')

  // 读取 USDC 余额
  useEffect(() => {
    if (!activeWallet) { setUsdcBalance(null); return }
    const network = process.env.NEXT_PUBLIC_X402_NETWORK ?? 'base-sepolia'
    const usdcAddress = network === 'base' ? USDC_ADDRESS_BASE : USDC_ADDRESS_BASE_SEPOLIA
    const rpcUrl = network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org'

    void (async () => {
      try {
        const res = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 1, method: 'eth_call',
            params: [{ to: usdcAddress, data: `0x70a08231000000000000000000000000${activeWallet.address.slice(2)}` }, 'latest'],
          }),
        })
        const json = await res.json() as { result?: string }
        if (json.result && json.result !== '0x') {
          const raw = BigInt(json.result)
          setUsdcBalance((Number(raw) / 1e6).toFixed(2))
        } else {
          setUsdcBalance('0.00')
        }
      } catch {
        setUsdcBalance(null)
      }
    })()
  }, [activeWallet])

  // 实际充值金额：选中预设 or 自定义
  const effectiveAmountUsd = customAmount
    ? Math.round(parseFloat(customAmount) * 100)
    : (selectedOption?.amountUsd ?? 0)

  const handleRecharge = async () => {
    if (!identityToken || !activeWallet || effectiveAmountUsd <= 0) {
      if (!activeWallet) setRechargeError('请先连接钱包')
      return
    }
    setRechargeStatus('loading')
    setRechargeError(null)
    try {
      const createRes = await fetch('/api/recharge-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${identityToken}` },
        body: JSON.stringify({ amountUsd: effectiveAmountUsd }),
      })
      if (!createRes.ok) throw new Error('创建充值订单失败')
      const { rechargeOrder } = (await createRes.json()) as { rechargeOrder: { id: string } }

      const payFetch = wrapFetchWithPayment({ walletAddress: activeWallet.address, fetch })
      const payRes = await payFetch(`/api/recharge-orders/${rechargeOrder.id}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${identityToken}` },
      })
      if (!payRes.ok) {
        const body = (await payRes.json()) as { error?: string }
        throw new Error(body.error ?? '支付失败')
      }

      setRechargeStatus('success')
      void refetch()
      void refreshSession()
    } catch (err) {
      setRechargeStatus('error')
      setRechargeError(err instanceof Error ? err.message : '支付失败，请重试')
    }
  }

  const closeModal = () => {
    setShowRechargeModal(false)
    setSelectedOption(null)
    setCustomAmount('')
    setRechargeStatus('idle')
    setRechargeError(null)
  }

  const chartData = useMemo(() => data?.usage?.[activeRange] ?? [], [activeRange, data])
  const chartUsd = useMemo(() => chartData.reduce((sum, item) => sum + item.usd, 0), [chartData])
  const displayIdentity = resolveDisplayIdentity(user, authIdentity, isAuthenticated)

  const paymentRows =
    activePaymentTab === 'recharge'
      ? (data?.rechargeOrders ?? []).map((order) => [
          order.id,
          <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
          `$${(order.amountUsd / 100).toFixed(2)}`,
          'USDC',
          new Date(order.createdAt).toLocaleString('zh-CN'),
        ])
      : []

  const consumptionRows = (data?.transactions ?? []).map((transaction) => [
    transaction.description,
    new Date(transaction.createdAt).toLocaleString('zh-CN'),
    <span key={`${transaction.id}-amount`} className={transaction.amount > 0 ? 'billing-value billing-value--positive' : 'billing-value billing-value--negative'}>
      {transaction.amount > 0 ? '+' : ''}${(transaction.amount / 100).toFixed(2)}
    </span>,
  ])

  return (
    <div className="page-stack page-stack--billing">
      {showRechargeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box__header">
              <h3>充值余额</h3>
              <button type="button" onClick={closeModal} aria-label="关闭"><X size={16} /></button>
            </div>
            {rechargeStatus === 'success' ? (
              <div className="modal-box__success">
                <p>充值成功！余额已到账。</p>
                <PrimaryButton onClick={closeModal}>关闭</PrimaryButton>
              </div>
            ) : (
              <>
                <p className="modal-box__desc">选择充值金额，使用钱包中的 USDC 完成支付。</p>
                <div className="recharge-options">
                  {RECHARGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.amountUsd}
                      type="button"
                      className={`recharge-option${selectedOption?.amountUsd === opt.amountUsd && !customAmount ? ' is-selected' : ''}`}
                      onClick={() => { setSelectedOption(opt); setCustomAmount('') }}
                    >
                      <strong>{opt.label}</strong>
                      <span>USDC</span>
                    </button>
                  ))}
                </div>
                <div className="recharge-custom">
                  <label className="recharge-custom__label">自定义金额 (USD)</label>
                  <div className="recharge-custom__input-wrap">
                    <span>$</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="输入金额"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedOption(null) }}
                      className="recharge-custom__input"
                    />
                  </div>
                </div>
                {rechargeError && <p className="modal-box__error">{rechargeError}</p>}

                {!activeWallet ? (
                  <div className="recharge-wallet-empty">
                    <div className="recharge-wallet-empty__icon">
                      <Wallet size={28} />
                    </div>
                    <strong>钱包未连接</strong>
                    <span>加密货币支付需要连接钱包</span>
                    <PrimaryButton onClick={() => connectWallet()}>
                      <Wallet size={14} />
                      连接钱包
                    </PrimaryButton>
                  </div>
                ) : (
                  <>
                    <div className="recharge-wallet-info">
                      <Wallet size={14} />
                      <span>{activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}</span>
                      {usdcBalance !== null && <span className="recharge-wallet-info__balance">{usdcBalance} USDC</span>}
                      <button type="button" className="recharge-wallet-info__disconnect" onClick={() => connectWallet()}>切换钱包</button>
                    </div>
                    <div className="modal-box__actions">
                      <SecondaryButton onClick={closeModal}>取消</SecondaryButton>
                      <PrimaryButton
                        onClick={() => void handleRecharge()}
                        disabled={effectiveAmountUsd <= 0 || rechargeStatus === 'loading'}
                      >
                        {rechargeStatus === 'loading' ? '支付中...' : `确认支付 $${(effectiveAmountUsd / 100).toFixed(2)}`}
                      </PrimaryButton>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid-three billing-top-grid">
        <Panel className="profile-card billing-profile-card">
          <span className="profile-card__label">我的资料</span>
          <div className="profile-card__row">
            <div className="billing-profile-card__content">
              <strong title={displayIdentity.title}>{displayIdentity.label}</strong>
              <p>{user?.id ? `UID: ${user.id}` : 'Privy 用户'}</p>
            </div>
            <div className="billing-profile-card__icon-row">
              <div className="metric-card__icon">
                <UserRound size={18} />
              </div>
              <button type="button" className="billing-copy-button" aria-label="复制用户信息">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </Panel>

        <StatCard label="USD 余额" value={`$${((data?.metrics.balance ?? 0) / 100).toFixed(2)}`} icon={CircleDollarSign} />
        <StatCard label="累计消费" value={`$${((data?.metrics.spentUsd ?? 0) / 100).toFixed(2)}`} icon={WalletCards} />
      </div>

      <section>
        <div className="section-title">套餐配额</div>
        <EmptyState
          title="您还没有激活的套餐"
          description="先购买套餐再回到这里查看配额、执行进度和消耗情况。"
          className="empty-state--billing"
          action={
            <Link href="/plans">
              <PrimaryButton>购买套餐</PrimaryButton>
            </Link>
          }
        />
      </section>

      <Panel className="chart-card chart-card--billing">
        <div className="chart-card__header">
          <div>
            <h3>使用量</h3>
            <p>(${(chartUsd / 100).toFixed(2)} USD)</p>
          </div>
          <div className="chart-card__ranges">
            {usageRanges.map((range) => (
              <button
                key={range.key}
                type="button"
                className={range.key === activeRange ? 'is-active' : ''}
                onClick={() => setActiveRange(range.key)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <UsageChart data={chartData} />
      </Panel>

      <Panel className="billing-section-panel">
        <div className="panel-heading billing-section-heading">
          <div>
            <h3>支付订单</h3>
            <p>显示最近 20 条支付订单</p>
          </div>
          <button type="button" className="billing-refresh-button" aria-label="刷新支付订单">
            <CreditCard size={14} />
          </button>
        </div>

        <div className="billing-tabs">
          {paymentTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`billing-tabs__item${tab.key === activePaymentTab ? ' is-active' : ''}`}
              onClick={() => setActivePaymentTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="billing-table-actions">
          <PrimaryButton onClick={() => setShowRechargeModal(true)}>充值余额</PrimaryButton>
        </div>
        <TableShell
          columns={['订单 ID', '状态', '金额', '代币', '创建时间']}
          rows={paymentRows}
          emptyText="当前分类下还没有支付订单。"
        />
      </Panel>

      <Panel className="billing-section-panel">
        <div className="panel-heading billing-section-heading">
          <div>
            <h3>交易记录</h3>
            <p>显示最近 20 条余额变动记录</p>
          </div>
          <button type="button" className="billing-refresh-button" aria-label="刷新交易记录">
            <CreditCard size={14} />
          </button>
        </div>

        <TableShell
          columns={['详情说明', '日期', '金额变化 (USD)']}
          rows={consumptionRows}
          emptyText="还没有交易记录。"
        />
      </Panel>
    </div>
  )
}
