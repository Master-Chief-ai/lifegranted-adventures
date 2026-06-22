import { getAllDisputes } from '@/lib/supabase/queries'
import { Card } from '@/components/ui/Card'
import { AdminDisputesManager } from '@/components/admin/AdminDisputesManager'

export default async function AdminDisputesPage() {
  const disputes = await getAllDisputes()
  const open = disputes.filter((d) => d.status === 'open')
  const resolved = disputes.filter((d) => d.status === 'resolved')
  const avgResolutionDays = resolved.length
    ? Math.round(
        resolved.reduce((sum, d) => sum + (new Date(d.resolved_at ?? d.created_at).getTime() - new Date(d.created_at).getTime()) / 86400000, 0) /
          resolved.length
      )
    : 0
  const refundsIssued = resolved.filter((d) => d.resolution?.toLowerCase().includes('refund')).length

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Disputes</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-[#B91C1C]">{open.length}</p>
          <p className="text-xs text-muted">Open disputes</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-navy">{avgResolutionDays}d</p>
          <p className="text-xs text-muted">Avg resolution time</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-[#15803D]">{resolved.length}</p>
          <p className="text-xs text-muted">Total resolved</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-gold-dark">{refundsIssued}</p>
          <p className="text-xs text-muted">Refunds issued</p>
        </Card>
      </div>

      <div className="mt-6">
        <AdminDisputesManager disputes={disputes} />
      </div>
    </div>
  )
}
