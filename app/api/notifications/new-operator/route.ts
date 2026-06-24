import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendNewOperatorNotification } from '@/lib/email'

const schema = z.object({
  businessName: z.string(),
  city: z.string(),
  email: z.string().email().optional().default(''),
})

export async function POST(request: Request) {
  try {
    const { businessName, city, email } = schema.parse(await request.json())
    await sendNewOperatorNotification(businessName, city, email)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
