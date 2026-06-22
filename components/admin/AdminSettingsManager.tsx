'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const NOTIFICATION_DEFAULTS = {
  newOperatorApplication: true,
  newBookingMade: true,
  disputeOpened: true,
  reviewSubmitted: true,
  ttbExpiryWarning: true,
}

const ADMIN_USERS = [{ email: 'stephen@lifegrantedadventures.co.tz', addedAt: '2025-01-10' }]

export function AdminSettingsManager() {
  const [commissionRate, setCommissionRate] = useState(12)
  const [platformName, setPlatformName] = useState('LifeGranted Adventures')
  const [whatsapp, setWhatsapp] = useState('+255000000000')
  const [email, setEmail] = useState('hello@lifegrantedadventures.co.tz')
  const [notifications, setNotifications] = useState(NOTIFICATION_DEFAULTS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [admins, setAdmins] = useState(ADMIN_USERS)

  function toggleNotification(key: keyof typeof NOTIFICATION_DEFAULTS) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function saveCommission() {
    toast.success(`Commission rate updated to ${commissionRate}%`)
  }
  function savePlatformInfo() {
    toast.success('Platform configuration saved')
  }
  function sendInvite() {
    if (!inviteEmail) return
    setAdmins((prev) => [...prev, { email: inviteEmail, addedAt: new Date().toISOString().split('T')[0] }])
    toast.success(`Invite sent to ${inviteEmail}`)
    setInviteEmail('')
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lga-platform-export.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  function clearTestData() {
    if (!confirm("This will delete all records with source='test'. Continue?")) return
    toast.success('Test data cleared')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Platform Configuration</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Input label="Commission Rate (%)" type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} />
            <p className="mt-1 text-xs text-gold-dark">Changing this affects all future bookings. Existing bookings are not affected.</p>
            <Button size="sm" className="mt-2" onClick={saveCommission}>
              Save
            </Button>
          </div>
          <Input label="Platform Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          <Input label="Support WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <Input label="Support Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button onClick={savePlatformInfo}>Save Configuration</Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Email Notifications</h2>
        <div className="mt-4 space-y-2">
          {(
            [
              ['newOperatorApplication', 'New operator application'],
              ['newBookingMade', 'New booking made'],
              ['disputeOpened', 'Dispute opened'],
              ['reviewSubmitted', 'Review submitted'],
              ['ttbExpiryWarning', 'Operator TTB expiry warning (30 days)'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between text-sm text-navy">
              {label}
              <input type="checkbox" checked={notifications[key]} onChange={() => toggleNotification(key)} className="accent-teal" />
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Admin Users</h2>
        <div className="mt-3 space-y-2">
          {admins.map((a) => (
            <div key={a.email} className="flex justify-between text-sm">
              <span className="text-navy">{a.email}</span>
              <span className="text-muted">{a.addedAt}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@example.com"
            className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
          />
          <Button onClick={sendInvite}>Send Invite</Button>
        </div>
      </Card>

      <Card className="border-[#B91C1C]/30 p-5">
        <h2 className="font-display text-lg font-semibold text-[#B91C1C]">Danger Zone</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportData}>
            Export All Data
          </Button>
          <Button variant="destructive" onClick={clearTestData}>
            Clear Test Data
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AdminSettingsManager
