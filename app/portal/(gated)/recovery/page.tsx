import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    notice_sent: 'bg-red-100 text-red-700',
    acknowledged: 'bg-yellow-100 text-yellow-700',
    appealing: 'bg-purple-100 text-purple-700',
    appeal_upheld: 'bg-green-100 text-green-700',
    appeal_rejected: 'bg-orange-100 text-orange-700',
    recovery_scheduled: 'bg-blue-100 text-blue-700',
    partially_recovered: 'bg-blue-100 text-blue-700',
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
    recovery_scheduled: 'Recovery Scheduled',
    partially_recovered: 'Partially Recovered',
    fully_recovered: 'Fully Recovered',
    written_off: 'Written Off',
    security_deposit_used: 'Deposit Applied',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {label[status] ?? status}
    </span>
  )
}

const ACTIVE = ['notice_sent', 'acknowledged', 'appealing', 'appeal_rejected', 'recovery_scheduled', 'partially_recovered']
const RESOLVED = ['fully_recovered', 'appeal_upheld', 'written_off', 'security_deposit_used']

export default async function OperatorRecoveryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let notices: any[] = []

  try {
    if (adminSupabase && user) {
      const { data: profile } = await adminSupabase
        .from('operators')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        const { data } = await adminSupabase
          .from('recovery_notices')
          .select('*, bookings(booking_ref, tours(title))')
          .eq('operator_id', profile.id)
          .order('created_at', { ascending: false })
        notices = data ?? []
      }
    }
  } catch {
    notices = []
  }

  const active = notices.filter(n => ACTIVE.includes(n.status))
  const resolved = notices.filter(n => RESOLVED.includes(n.status))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0C1829]">Recovery Notices</h1>
        <p className="text-[#5A6B7A] mt-1">
          Formal notices issued when a tourist refund was paid by the platform Guarantee Fund on your behalf.
        </p>
      </div>

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#0C1829] mb-4">Active ({active.length})</h2>
          <div className="space-y-3">
            {active.map(n => (
              <Link
                key={n.id}
                href={`/portal/recovery/${n.reference_code}`}
                className="block bg-white border border-red-200 rounded-xl p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-mono text-sm text-[#5A6B7A]">{n.reference_code}</p>
                    <p className="font-semibold text-[#0C1829] mt-0.5">{n.bookings?.tours?.title ?? 'Tour'}</p>
                    <p className="text-sm text-[#5A6B7A]">Booking: {n.bookings?.booking_ref}</p>
                  </div>
                  <div className="text-right">
                    {statusBadge(n.status)}
                    <p className="text-lg font-bold text-red-600 mt-1">${Number(n.remaining_to_recover).toFixed(2)}</p>
                    <p className="text-xs text-[#5A6B7A]">remaining</p>
                  </div>
                </div>
                {n.status === 'notice_sent' && (
                  <div className="mt-3 pt-3 border-t border-red-100 text-sm text-red-600 font-medium">
                    Action required — appeal by {new Date(n.appeal_deadline as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {resolved.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#0C1829] mb-4">Resolved ({resolved.length})</h2>
          <div className="space-y-3">
            {resolved.map(n => (
              <Link
                key={n.id}
                href={`/portal/recovery/${n.reference_code}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-mono text-sm text-[#5A6B7A]">{n.reference_code}</p>
                    <p className="font-semibold text-[#0C1829] mt-0.5">{n.bookings?.tours?.title ?? 'Tour'}</p>
                  </div>
                  <div className="text-right">
                    {statusBadge(n.status)}
                    <p className="text-sm text-[#5A6B7A] mt-1">${Number(n.total_recovery_amount).toFixed(2)} total</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {notices.length === 0 && (
        <div className="bg-[#E6F4F4] rounded-xl p-8 text-center">
          <p className="text-[#006B6B] font-medium">No recovery notices</p>
          <p className="text-[#5A6B7A] text-sm mt-1">You have a clean record. Keep delivering great experiences!</p>
        </div>
      )}
    </div>
  )
}
