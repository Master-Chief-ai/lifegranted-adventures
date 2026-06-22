import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'USD' | 'TZS' = 'USD'): string {
  if (currency === 'TZS') {
    return `TZS ${Math.round(amount).toLocaleString('en-US')}`
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const FLAG_OVERRIDES: Record<string, string> = {
  EN: '🇬🇧',
}

export function getCountryFlag(countryCode?: string | null): string {
  if (!countryCode) return '🌍'
  const code = countryCode.toUpperCase()
  if (FLAG_OVERRIDES[code]) return FLAG_OVERRIDES[code]
  if (code.length !== 2) return '🌍'
  const codePoints = code.split('').map((c) => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

const REGION_COLORS: Record<string, string> = {
  'Western Circuit': 'bg-teal-light text-teal',
  'Northern Circuit': 'bg-amber-100 text-amber-700',
  Zanzibar: 'bg-blue-100 text-blue-700',
  Kilimanjaro: 'bg-purple-100 text-purple-700',
  'Southern Circuit': 'bg-green-100 text-green-700',
  'Lake Victoria': 'bg-cyan-100 text-cyan-700',
}

export function getRegionColor(region: string): string {
  return REGION_COLORS[region] ?? 'bg-gray-100 text-gray-700'
}
