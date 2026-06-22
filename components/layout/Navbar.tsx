'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/Button'

const NAV_LINKS = [
  { href: '/tours', label: 'Tours' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/operators', label: 'Operators' },
  { href: '/blog', label: 'Blog' },
]

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border bg-white/95 transition-shadow',
        scrolled ? 'shadow-card backdrop-blur-md' : ''
      )}
    >
      <div className="container-lg flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal font-display text-sm font-bold text-white">
            LGA
          </span>
          <span className="font-display text-lg font-bold text-navy">LifeGranted Adventures</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium text-navy transition-colors hover:text-teal',
                  active && 'border-b-2 border-teal text-teal'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Sign In
          </Link>
          <Link href="/operator/register" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}>
            List Your Tours
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="text-navy" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          <div className="flex w-72 flex-col gap-6 bg-white p-6 shadow-card-hover animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-navy">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="text-navy" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-base font-medium text-navy hover:text-teal">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}>
                Sign In
              </Link>
              <Link href="/operator/register" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: 'primary' }), 'w-full')}>
                List Your Tours
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
