import { adminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    notice_sent: 'bg-red-100 text-red-700',
    acknowledged: 'bg-yellow-100 text-yellow-700',
    appealing: 'bg-purple-100 text-purple-700',
    appeal_upheld: 'bg-green-100 text-green-700',
    appeal_rejected: 'bg-orange-100 text-orange-700',
    recovery_scheduled: 'bg-blue-100 text-blue-700',
    partially_recovered: 'bg-cyan-100 text-cyan-700',
    fully_recovered: 'bg-green-100 text-green-700',
    written_off: 'bg-gray-100 text-gray-600',
    security_deposit_used: 'bg-teal-100 text-teal-700',
  }
  const label: Record<string, string> = {
    notice_sent: 'Notice Sent',
    acknowledged: 'Acknowledged',
    appealing: 'Appeal Pending',
    appeal_upheld: 'Appeal Upheld',
    appeal_rejected: 'Appeal Rejected',
    recovery_scheduled: 'Scheduled',
    partially_recovered: 'Partial',
    fully_recovered: 'Recovered',
    written_off: 'Written Off',
    security_deposit_used: 'Deposit Used',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {label[status] ?? status}
    </span>
  )
}

export default async function AdminRecoveryPage() {
  let notices: any[] = []
  let totalOutstanding = 0
  let totalRecovered = 0
  let appealsActive = 0

  try {
    if (adminSupabase) {
      const { data } = await adminSupabase
        .from('recovery_notices')
        .select('*, operators(business_name, email), bookings(booking_ref, tours(title))')
        .order('created_at', { ascending: false })
      notices = data ?? []

      for (const n of notices) {
        totalOutstanding += Number(n.remaining_to_recover ?? 0)
        totalRecovered += Number(n.total_recovered_so_far ?? 0)
        if (n.status === 'appealing') appealsActive++
      }
    }
  } catch {
    notices = []
  }

  const active = notices.filter(n => !['fully_recovered', 'appeal_upheld', 'written_off', 'security_deposit_used'].includes(n.status))
  const resolved = notices.filter(n => ['fully_recovered', 'appeal_upheld', 'written_off', 'security_deposit_used'].includes(n.status))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0C1829]">Recovery Management</h1>
        <p className="text-[#5A6B7A] mt-1">Track and manage operator recovery notices issued after Guarantee Fund payouts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-[#5A6B7A]">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-[#5A6B7A]">Total Recovered</p>
          <p className="text-2xl font-bold text-[#006B6B]">${totalRecovered.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-[#5A6B7A]">Active Appeals</p>
          <p className="text-2xl font-bold text-purple-600">{appealsActive}</p>
        </div>
      </div>

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#0C1829] mb-4">Active ({active.length})</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-[#5A6B7A] font-medium">Ref</th>
                  <th className="text-left px-4 py-3 text-[#5A6B7A] font-medium">Operator</th>
                  <th className="text-left px-4 py-3 text-[#5A6B7A] font-medium">Tour</th>
                  <th className="text-left px-4 py-3 text-[#5A6B7A] font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-[#5A6B7A] font-medium">Remaining</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {active.map(n => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{n.reference_code}</td>
                    <td className="px-4 py-3">{n.operators?.business_name ?? '—'}</td>
                    <td className="px-4 py-3 text-[#5A6B7A]">{n.bookings?.tours?.title ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(n.status)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">${Number(n.remaining_to_recover).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/recovery/${n.reference_code}`} className="text-[#006B6B] text-xs font-medium hover:underline">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {resolved.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#0C1829] mb-4">Resolved ({resolved.length})</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-[#5A6B7A] font-medium">Ref</th>
                  <th className="text-left px-4 py-3 text-[#5A6B7A] font-medium">Operator</th>
                  <th className="text-left px-4 py-3 text-[#5A6B7A] font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-[#5A6B7A] font-medium">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resolved.map(n => (
                  <tr key={n.id} className="hover:bg-gray-50 text-[#5A6B7A]">
                    <td className="px-4 py-3 font-mono text-xs">{n.reference_code}</td>
                    <td className="px-4 py-3">{n.operators?.business_name ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(n.status)}</td>
                    <td className="px-4 py-3 text-right">${Number(n.total_recovery_amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/recovery/${n.reference_code}`} className="text-[#006B6B] text-xs font-medium hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {notices.length === 0 && (
        <div className="bg-[#E6F4F4] rounded-xl p-8 text-center">
          <p className="text-[#006B6B] font-medium">No recovery notices yet</p>
          <p className="text-[#5A6B7A] text-sm mt-1">Recovery notices are created when a refund is approved and the Guarantee Fund pays the tourist.</p>
        </div>
      )}
    </div>
  )
}
