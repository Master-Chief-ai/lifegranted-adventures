import type { Metadata } from 'next'
import { getFundBalance, getFundTransactions } from '@/lib/guarantee-fund'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { GuaranteeFundChart } from '@/components/admin/GuaranteeFundChart'
import { GuaranteeFundAdjust } from '@/components/admin/GuaranteeFundAdjust'

export const metadata: Metadata = { title: 'Guarantee Fund — Admin' }

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  contribution: { label: 'Contribution', className: 'bg-teal-light text-teal' },
  payout_tourist: { label: 'Payout (Tourist)', className: 'bg-[#FEE2E2] text-[#B91C1C]' },
  recovery: { label: 'Recovery', className: 'bg-[#DBEAFE] text-[#1D4ED8]' },
  adjustment: { label: 'Adjustment', className: 'bg-[#F3F4F6] text-[#374151]' },
}

function buildMonthlyChart(
  transactions: Awaited<ReturnType<typeof getFundTransactions>>
) {
  const map = new Map<string, { contributions: number; payouts: number }>()
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    map.set(key, { contributions: 0, payouts: 0 })
  }
  for (const tx of transactions) {
    const d = new Date(tx.created_at)
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    if (!map.has(key)) continue
    const entry = map.get(key)!
    if (tx.transaction_type === 'contribution') entry.contributions += tx.amount
    else if (tx.transaction_type === 'payout_tourist') entry.payouts += tx.amount
  }
  return Array.from(map.entries()).map(([month, v]) => ({ month, ...v }))
}

function healthLabel(balance: number) {
  const avgMonthly = 2000
  const months = balance / avgMonthly
  if (months >= 3) return { label: 'Fund healthy', color: '#006B6B', bgColor: 'bg-teal', pct: 100 }
  if (months >= 1) return { label: 'Fund adequate', color: '#C9A84C', bgColor: 'bg-gold', pct: Math.round((months / 3) * 100) }
  return { label: 'Fund needs attention', color: '#B91C1C', bgColor: 'bg-[#B91C1C]', pct: Math.max(5, Math.round((months / 3) * 100)) }
}

export default async function GuaranteeFundPage() {
  const [balance, transactions] = await Promise.all([getFundBalance(), getFundTransactions(50)])

  const bal = balance ?? { current_balance: 0, total_contributed: 0, total_paid_out: 0, total_recovered: 0 }
  const chartData = buildMonthlyChart(transactions)
  const health = healthLabel(bal.current_balance)

  const csvContent =
    'Date,Type,Booking Ref,Amount,Balance After,Notes\n' +
    transactions
      .map((t) =>
        [
          formatDate(t.created_at),
          t.transaction_type,
          t.bookings?.booking_ref ?? '',
          t.amount,
          t.balance_after,
          `"${(t.notes ?? '').replace(/"/g, '""')}"`,
        ].join(',')
      )
      .join('\n')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Guarantee Fund</h1>
        <p className="mt-1 text-sm text-muted">3% of every booking commission goes here. Used to protect tourists from operator failures.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted">Current Balance</p>
          <p className="mt-1 font-display text-3xl font-bold text-teal">{formatCurrency(bal.current_balance)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Total Contributed</p>
          <p className="mt-1 font-display text-2xl font-bold text-navy">{formatCurrency(bal.total_contributed)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Total Paid Out</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#B91C1C]">{formatCurrency(bal.total_paid_out)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Recovered from Operators</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#1D4ED8]">{formatCurrency(bal.total_recovered)}</p>
        </Card>
      </div>

      {/* Fund Health */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-navy">Fund Health</h2>
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${health.color}22`, color: health.color }}>
            {health.label}
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-border">
          <div className={`h-full rounded-full transition-all ${health.bgColor}`} style={{ width: `${health.pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">Based on estimated 2–3 months average payout coverage</p>
      </Card>

      {/* Chart */}
      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-navy">Monthly Contributions vs Payouts (12 months)</h2>
        <GuaranteeFundChart data={chartData} />
      </Card>

      {/* Transactions */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-navy">Recent Transactions</h2>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`}
            download="guarantee-fund.csv"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-navy hover:bg-cream"
          >
            Export CSV
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Booking Ref</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Balance After</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No transactions yet.
                  </td>
                </tr>
              )}
              {transactions.map((tx) => {
                const badge = TYPE_BADGE[tx.transaction_type] ?? TYPE_BADGE.adjustment
                const isNeg = tx.transaction_type === 'payout_tourist'
                return (
                  <tr key={tx.id} className="hover:bg-cream/40">
                    <td className="px-4 py-3 text-muted">{formatDate(tx.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3 text-navy">{tx.bookings?.booking_ref ?? '—'}</td>
                    <td className={`px-4 py-3 text-right font-medium ${isNeg ? 'text-[#B91C1C]' : 'text-teal'}`}>
                      {isNeg ? '−' : '+'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-navy">{formatCurrency(tx.balance_after)}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted">{tx.notes ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Adjustment */}
      <GuaranteeFundAdjust />
    </div>
  )
}
