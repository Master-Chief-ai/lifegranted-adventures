'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Card } from '@/components/ui/Card'

export interface DashboardChartsProps {
  monthlyBookings: { month: string; bookings: number }[]
  revenueByTour: { name: string; revenue: number }[]
}

export function DashboardCharts({ monthlyBookings, revenueByTour }: DashboardChartsProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="p-5 lg:col-span-3">
        <h3 className="font-display text-base font-semibold text-navy">Bookings by Month</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyBookings}>
              <CartesianGrid vertical={false} stroke="#DDE8E8" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5A6B7A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#5A6B7A' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#006B6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <h3 className="font-display text-base font-semibold text-navy">Revenue by Tour</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByTour} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid horizontal={false} stroke="#DDE8E8" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#5A6B7A' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#5A6B7A' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#C9A84C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

export default DashboardCharts
