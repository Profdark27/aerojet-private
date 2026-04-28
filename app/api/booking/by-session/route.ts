import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/booking/by-session?sessionId=xxx
// Public: called by success page to show persistent confirmationCode
// Only exposes non-sensitive fields

export async function GET(request: NextRequest) {
  const sessionId = new URL(request.url).searchParams.get('sessionId')
  if (!sessionId) return Response.json({ error: 'sessionId richiesto' }, { status: 400 })

  const booking = await prisma.booking.findFirst({
    where: { stripeSessionId: sessionId },
    select: {
      confirmationCode: true,
      fromCity: true,
      toCity: true,
      depositAmount: true,
      totalPrice: true,
      status: true,
    },
  })

  if (!booking) {
    // Webhook might not have fired yet — return 404 so the page falls back gracefully
    return Response.json({ error: 'Non trovato' }, { status: 404 })
  }

  return Response.json(booking)
}
