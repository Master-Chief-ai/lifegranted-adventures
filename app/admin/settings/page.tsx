import { AdminSettingsManager } from '@/components/admin/AdminSettingsManager'

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Platform Settings</h1>
      <div className="mt-6">
        <AdminSettingsManager />
      </div>
    </div>
  )
}
