import { getCurrentAdmin } from '@/lib/admin-auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin()

  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      <AdminSidebar admin={admin} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
