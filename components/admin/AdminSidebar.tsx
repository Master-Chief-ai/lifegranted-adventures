'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, ClipboardList, Scale, Star, FileText, Settings, Menu, X, LogOut, ShieldCheck, RefreshCcw } from 'lucide-react'
import type { AdminUser } from '@/lib/admin-auth'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/operators', label: 'Operators', icon: Building2 },
  { href: '/admin/bookings', label: 'All Bookings', icon: ClipboardList },
  { href: '/admin/disputes', label: 'Disputes', icon: Scale },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/guarantee-fund', label: 'Guarantee Fund', icon: ShieldCheck },
  { href: '/admin/recovery', label: 'Recovery', icon: RefreshCcw },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? 'border-[#B91C1C] bg-white/5 text-white' : 'border-transparent text-white/70 hover:bg-white/5'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({ admin }: { admin: AdminUser }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between bg-navy px-4 py-3 lg:hidden">
        <span className="font-display text-sm font-bold text-white">LifeGranted Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="text-white" />
        </button>
      </div>

      <aside className="hidden w-60 shrink-0 flex-col bg-navy py-6 lg:flex">
        <div className="flex items-center gap-2 px-4 pb-6">
          <span className="font-display text-base font-bold text-white">LifeGranted Adventures</span>
        </div>
        <div className="px-4 pb-4">
          <span className="rounded bg-[#B91C1C] px-2 py-0.5 text-[10px] font-bold uppercase text-white">Admin Panel</span>
        </div>
        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        <div className="mt-auto px-4 pt-6">
          <p className="text-sm font-medium text-white">{admin.name}</p>
          <p className="text-xs text-white/50">{admin.email}</p>
          <Link href="/auth/login" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white">
            <LogOut size={13} /> Sign Out
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 flex-col bg-navy py-6">
            <div className="flex items-center justify-between px-4 pb-6">
              <span className="font-display text-sm font-bold text-white">Admin Panel</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="text-white" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}

export default AdminSidebar
