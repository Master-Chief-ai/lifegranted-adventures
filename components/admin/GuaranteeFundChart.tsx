'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts'

interface MonthData {
  month: string
  contributions: number
  payouts: number
}

export function GuaranteeFundChart({ data }: { data: MonthData[] }) {
  const hasPayoutSpike = data.some((d) => d.payouts > d.contributions)

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EC" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5A6B7A' }} />
          <YAxis tick={{ fontSize: 12, fill: '#5A6B7A' }} tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(v) => (typeof v === 'number' ? `$${v.toFixed(2)}` : v)} />
          <Legend />
          {hasPayoutSpike &&
            data.map((d, i) =>
              d.payouts > d.contributions ? (
                <ReferenceArea key={i} x1={d.month} x2={d.month} fill="#FEE2E2" fillOpacity={0.5} />
              ) : null
            )}
          <Line type="monotone" dataKey="contributions" name="Contributions" stroke="#006B6B" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="payouts" name="Payouts" stroke="#C9A84C" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
