import fs from 'fs'
import path from 'path'
import type { Booking } from '@/types'

// File-backed store for bookings created during local development — demo-only,
// since there is no real database connected in mock mode. A plain in-memory Map
// does not survive Next.js dev-server hot-reloads, so we persist to a tmp file instead.
// Server-only module — never import this from a client component.

const RUNTIME_STORE_PATH = path.join(process.cwd(), '.next', 'cache', 'lga-mock-bookings.json')

function readRuntimeBookings(): Record<string, Booking> {
  try {
    return JSON.parse(fs.readFileSync(RUNTIME_STORE_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function writeRuntimeBookings(bookings: Record<string, Booking>) {
  try {
    fs.mkdirSync(path.dirname(RUNTIME_STORE_PATH), { recursive: true })
    fs.writeFileSync(RUNTIME_STORE_PATH, JSON.stringify(bookings))
  } catch {
    // best-effort only — mock persistence is not critical
  }
}

export function addRuntimeBooking(booking: Booking) {
  const bookings = readRuntimeBookings()
  bookings[booking.booking_ref] = booking
  writeRuntimeBookings(bookings)
}

export function getRuntimeBooking(ref: string): Booking | undefined {
  return readRuntimeBookings()[ref]
}
