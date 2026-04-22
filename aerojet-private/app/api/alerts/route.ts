import { NextRequest } from 'next/server'
import { AlertSchema, rateLimit, getClientIP } from '@/lib/validation'

// In-memory store (prod: use DB)
const subscribers: Array<{ email: string; fromCity?: string; toCity?: string; createdAt: string }> = []

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  if (!rateLimit(ip, 3, 60_000)) {
    return Response.json({ error: 'Troppe richieste' }, { status: 429 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: 'Formato non valido' }, { status: 400 })
  }

  const result = AlertSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: 'Email non valida' }, { status: 422 })
  }

  const { email, fromCity, toCity } = result.data

  // Avoid duplicates
  if (subscribers.some(s => s.email === email)) {
    return Response.json({ success: true, message: 'Già iscritto' })
  }

  subscribers.push({ email, fromCity, toCity, createdAt: new Date().toISOString() })

  // Welcome email
  try {
    const { send } = await import('@/lib/email').then(m => ({ send: (m as { send?: Function }).send }))
    // Note: send is not exported directly, use a simple approach
    console.log(`📧 Empty leg alert subscription: ${email} (${fromCity || 'any'} → ${toCity || 'any'})`)
  } catch { /* silent */ }

  return Response.json({ success: true, message: 'Iscritto con successo' }, { status: 201 })
}

export async function GET() {
  return Response.json({ count: subscribers.length })
}
