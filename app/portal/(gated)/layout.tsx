import { redirect } from 'next/navigation'
import { getCurrentOperator } from '@/lib/operator-auth'
import { PortalSidebar } from '@/components/portal/PortalSidebar'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const operator = await getCurrentOperator()

  if (operator.status === 'pending') {
    redirect('/portal/pending')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      <PortalSidebar operator={operator} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
