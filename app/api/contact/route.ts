import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    schema.parse(body)
    // In production this would send via Resend and/or store in Supabase.
    // Mock mode: always succeed.
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 })
  }
}
