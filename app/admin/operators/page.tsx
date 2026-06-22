import { getAllOperatorsAdmin } from '@/lib/supabase/queries'
import { AdminOperatorsManager } from '@/components/admin/AdminOperatorsManager'

export default async function AdminOperatorsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const operators = await getAllOperatorsAdmin()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Operators</h1>
      <div className="mt-6">
        <AdminOperatorsManager operators={operators} initialTab={params.tab ?? 'pending'} />
      </div>
    </div>
  )
}
