'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { COUNTRIES } from '@/lib/constants'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: 'Demo Traveler',
    phone: '+1 555 010 0101',
    whatsapp: '+1 555 010 0101',
    nationality: 'US',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Profile updated')
    } catch {
      toast.error('Could not update your profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="font-display text-xl font-bold text-navy">Profile</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Nationality</label>
            <select
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-bold text-navy">Change Password</h2>
        <form className="mt-4 space-y-4">
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
          <Button type="submit" variant="secondary">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  )
}
