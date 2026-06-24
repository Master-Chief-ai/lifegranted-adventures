import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactMessage } from '@/lib/email'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const { name, email, message } = schema.parse(await request.json())
    await sendContactMessage(name, email, message)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 })
  }
}
