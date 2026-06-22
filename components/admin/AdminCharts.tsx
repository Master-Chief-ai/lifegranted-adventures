'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts'
import { Card } from '@/components/ui/Card'

const PIE_COLORS = ['#006B6B', '#159090', '#3FAFAF', '#7FC9C9', '#C9A84C']

export interface AdminChartsProps {
  dailyRevenue: { date: string; revenue: number }[]
  tourTypeData: { name: string; value: number }[]
  topTours: { name: string; count: number; revenue: number }[]
}

export function AdminCharts({ dailyRevenue, tourTypeData, topTours }: AdminChartsProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h3 className="font-display text-base font-semibold text-navy">Daily Revenue — Last 30 Days</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid vertical={false} stroke="#DDE8E8" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5A6B7A' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: '#5A6B7A' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#006B6B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-navy">Bookings by Tour Type</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tourTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} ${value}%`}>
                  {tourTypeData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-display text-base font-semibold text-navy">Top Performing Tours</h3>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topTours} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid horizontal={false} stroke="#DDE8E8" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#5A6B7A' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#5A6B7A' }} axisLine={false} tickLine={false} width={160} />
              <Tooltip />
              <Bar dataKey="count" fill="#C9A84C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

export default AdminCharts
