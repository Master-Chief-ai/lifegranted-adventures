import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ businessName: z.string(), city: z.string() })

export async function POST(request: Request) {
  try {
    const { businessName, city } = schema.parse(await request.json())
    console.log(`NEW OPERATOR APPLICATION: ${businessName} from ${city}`)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
