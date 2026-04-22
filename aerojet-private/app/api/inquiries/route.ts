import { NextRequest } from 'next/server'
import { InquirySchema, rateLimit, getClientIP } from '@/lib/validation'

const inquiries: Array<{
  id: string; name: string; email: string; phone?: string
  fromCity?: string; toCity?: string; flightDate?: string
  pax?: number; budget?: string; message: string
  status: string; createdAt: string; flightType: string
}> = []

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  if (!rateLimit(ip, 5, 60_000)) {
    return Response.json({ error: 'Troppe richieste. Attendi un minuto.' }, { status: 429 })
  }
  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: 'Formato non valido' }, { status: 400 })
  }
  const result = InquirySchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: 'Dati non validi', details: result.error.flatten().fieldErrors }, { status: 422 })
  }
  const { name, email, phone, fromCity, toCity, flightDate, pax, budget, message, flightType } = result.data
  const inquiry = {
    id: `RQ-${Date.now().toString(36).toUpperCase()}`,
    name, email, phone, fromCity, toCity, flightDate, pax, budget, message, flightType,
    status: 'NEW', createdAt: new Date().toISOString(),
  }
  inquiries.push(inquiry)

  // Fire-and-forget: emails + real-time notification
  void Promise.allSettled([
    import('@/lib/email').then(({ sendRequestReceived }) =>
      sendRequestReceived({ to: email, name, from: fromCity || '', to: toCity || '', date: flightDate || 'Da definire', requestId: inquiry.id })
    ),
    process.env.BROKER_EMAIL
      ? import('@/lib/email').then(({ notifyBrokerNewRequest }) =>
          notifyBrokerNewRequest({ brokerEmail: process.env.BROKER_EMAIL!, clientName: name, clientEmail: email, from: fromCity || '', to: toCity || '', date: flightDate || '', pax: pax || 1, budget: budget || 'N/D', message, requestId: inquiry.id })
        )
      : Promise.resolve(),
    import('@/app/api/notifications/route').then(({ pushNotification }) =>
      pushNotification('new_request', { clientName: name, route: fromCity && toCity ? `${fromCity} → ${toCity}` : 'N/D', requestId: inquiry.id, budget: budget || '' })
    ).catch(() => {}),
  ])

  return Response.json({ success: true, id: inquiry.id }, { status: 201 })
}

export async function GET() {
  return Response.json({ inquiries, total: inquiries.length })
}
