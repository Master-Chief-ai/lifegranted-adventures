'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Palmtree, CalendarDays, ClipboardList, Wallet, Star, User, Menu, X, LogOut, Scale, AlertCircle } from 'lucide-react'
import type { Operator } from '@/types'

const NAV_ITEMS = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/tours', label: 'My Tours', icon: Palmtree },
  { href: '/portal/availability', label: 'Availability', icon: CalendarDays },
  { href: '/portal/bookings', label: 'Bookings', icon: ClipboardList },
  { href: '/portal/payouts', label: 'Payouts', icon: Wallet },
  { href: '/portal/reviews', label: 'Reviews', icon: Star },
  { href: '/portal/disputes', label: 'Disputes', icon: Scale },
  { href: '/portal/recovery', label: 'Recovery Notices', icon: AlertCircle },
  { href: '/portal/profile', label: 'My Profile', icon: User },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = item.href === '/portal' ? pathname === '/portal' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? 'border-teal bg-teal/10 text-teal' : 'border-transparent text-white/70 hover:bg-white/5'
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

export function PortalSidebar({ operator }: { operator: Operator }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between bg-navy px-4 py-3 lg:hidden">
        <span className="font-display text-sm font-bold text-white">LifeGranted Operator Portal</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="text-white" />
        </button>
      </div>

      <aside className="hidden w-60 shrink-0 flex-col bg-navy py-6 lg:flex">
        <div className="px-4 pb-6">
          <span className="font-display text-base font-bold text-white">LifeGranted Adventures</span>
          <p className="text-xs text-white/50">Operator Portal</p>
        </div>
        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        <div className="mt-auto px-4 pt-6">
          <p className="text-sm font-medium text-white">{operator.business_name}</p>
          <p className="text-xs text-white/50">{operator.city}</p>
          <Link href={`/operators/${operator.slug}`} target="_blank" className="mt-3 block text-xs font-medium text-teal hover:underline">
            View My Listing
          </Link>
          <Link href="/auth/login" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white">
            <LogOut size={13} /> Sign Out
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 flex-col bg-navy py-6">
            <div className="flex items-center justify-between px-4 pb-6">
              <span className="font-display text-sm font-bold text-white">Operator Portal</span>
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

export default PortalSidebar
