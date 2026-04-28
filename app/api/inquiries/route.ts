import { NextRequest } from 'next/server'
import { InquirySchema, rateLimit, getClientIP } from '@/lib/validation'
import { calculateLeadScore } from '@/lib/leadScoring'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
    return Response.json(
      { error: 'Dati non validi', details: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const data = result.data

  // Scoring automatico
  const scoring = calculateLeadScore(data)

  // Salva su DB
  const inquiry = await prisma.inquiry.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      fromCity: data.fromCity,
      toCity: data.toCity,
      flightDate: data.flightDate,
      pax: data.pax,
      budget: data.budget,
      message: data.message,
      flightType: data.flightType,
      status: 'NEW',
      pipelineStatus: 'NEW',
      // Scoring
      leadScore: scoring.leadScore,
      leadTier: scoring.leadTier,
      budgetNumeric: scoring.budgetNumeric,
      urgency: scoring.urgency,
      sameDay: scoring.sameDay,
      membershipInterest: scoring.membershipInterest,
      suggestedAction: scoring.suggestedAction,
      // Decision engine
      nextAction: scoring.nextAction,
      urgencyFlag: scoring.urgencyFlag,
      // Economics
      operatorCostEstimate: scoring.operatorCostEstimate,
      clientQuoteEstimate: scoring.clientQuoteEstimate,
      suggestedQuote: scoring.suggestedQuote,
      optimizedQuote: scoring.optimizedQuote,
      optimizedMargin: scoring.optimizedMargin,
      marginEstimate: scoring.marginEstimate,
      marginPercent: scoring.marginPercent,
      revenuePotential: scoring.revenuePotential,
      // Follow-up schedule (mock: cron-ready)
      nextFollowUpAt: new Date(Date.now() + 30 * 60 * 1000),
      followUp2hAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      followUp24hAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  // Fire-and-forget: email + notifica real-time
  void Promise.allSettled([
    // Email immediata al cliente
    import('@/lib/email').then(({ sendRequestReceived }) =>
      sendRequestReceived({
        to: data.email,
        name: data.name,
        from: data.fromCity || '',
        dest: data.toCity || '',
        date: data.flightDate || 'Da definire',
        requestId: inquiry.id,
      })
    ),
    // Email broker con scoring completo
    process.env.BROKER_EMAIL
      ? import('@/lib/email').then(({ notifyBrokerScoredLead }) =>
          notifyBrokerScoredLead({
            brokerEmail: process.env.BROKER_EMAIL!,
            clientName: data.name,
            clientEmail: data.email,
            phone: data.phone,
            from: data.fromCity || '',
            to: data.toCity || '',
            date: data.flightDate || '',
            pax: data.pax || 1,
            budget: data.budget || 'N/D',
            message: data.message,
            requestId: inquiry.id,
            leadTier: scoring.leadTier,
            leadScore: scoring.leadScore,
            suggestedAction: scoring.suggestedAction,
            marginEstimate: scoring.marginEstimate,
            suggestedQuote: scoring.suggestedQuote,
          })
        )
      : Promise.resolve(),
    // Notifica real-time dashboard
    import('@/app/api/notifications/route').then(({ pushNotification }) =>
      pushNotification('new_request', {
        clientName: data.name,
        route: data.fromCity && data.toCity ? `${data.fromCity} → ${data.toCity}` : 'N/D',
        requestId: inquiry.id,
        budget: data.budget || '',
        leadTier: scoring.leadTier,
        leadScore: scoring.leadScore,
      })
    ).catch(() => {}),
  ])

  return Response.json(
    {
      success: true,
      id: inquiry.id,
      leadTier: scoring.leadTier,
      leadScore: scoring.leadScore,
      nextAction: scoring.nextAction,
      urgencyFlag: scoring.urgencyFlag,
      optimizedQuote: scoring.optimizedQuote,
      suggestedAction: scoring.suggestedAction,
    },
    { status: 201 }
  )
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['BROKER', 'ADMIN'].includes(session.user.role)) {
    return Response.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const tier = searchParams.get('tier')
  const status = searchParams.get('status')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
  const orderBy = searchParams.get('orderBy') === 'score' ? 'leadScore' : 'createdAt'

  const inquiries = await prisma.inquiry.findMany({
    where: {
      ...(tier ? { leadTier: tier } : {}),
      ...(status ? { pipelineStatus: status } : {}),
    },
    orderBy: { [orderBy]: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      fromCity: true,
      toCity: true,
      flightDate: true,
      pax: true,
      budget: true,
      flightType: true,
      status: true,
      pipelineStatus: true,
      leadScore: true,
      leadTier: true,
      budgetNumeric: true,
      urgency: true,
      sameDay: true,
      membershipInterest: true,
      suggestedAction: true,
      nextAction: true,
      urgencyFlag: true,
      marginEstimate: true,
      marginPercent: true,
      clientQuoteEstimate: true,
      suggestedQuote: true,
      optimizedQuote: true,
      optimizedMargin: true,
      revenuePotential: true,
      operatorCostEstimate: true,
      depositPaid: true,
      depositAmount: true,
      stripeSessionId: true,
      createdAt: true,
    },
  })

  const total = await prisma.inquiry.count()
  const byTier = await prisma.inquiry.groupBy({
    by: ['leadTier'],
    _count: { id: true },
  })

  const pipelineValue = await prisma.inquiry.aggregate({
    _sum: { clientQuoteEstimate: true, marginEstimate: true },
    where: { pipelineStatus: { notIn: ['WON', 'LOST'] } },
  })

  return Response.json({
    inquiries,
    total,
    byTier: Object.fromEntries(byTier.map(r => [r.leadTier, r._count.id])),
    pipeline: {
      totalValue: pipelineValue._sum.clientQuoteEstimate || 0,
      totalMargin: pipelineValue._sum.marginEstimate || 0,
    },
  })
}

// PATCH per aggiornare pipeline status o note broker
export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['BROKER', 'ADMIN'].includes(session.user.role)) {
    return Response.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: 'Formato non valido' }, { status: 400 })
  }

  const { id, pipelineStatus, internalNotes, nextFollowUpAt, operatorCostEstimate, marginRealized } = body as {
    id: string
    pipelineStatus?: string
    internalNotes?: string
    nextFollowUpAt?: string
    operatorCostEstimate?: number
    marginRealized?: number
  }

  if (!id) return Response.json({ error: 'id richiesto' }, { status: 400 })

  const validStatuses = ['NEW', 'CONTACTED', 'QUOTING', 'QUOTED', 'WON', 'LOST']
  if (pipelineStatus && !validStatuses.includes(pipelineStatus)) {
    return Response.json({ error: 'pipelineStatus non valido' }, { status: 400 })
  }

  // Ricalcola margine se costo operatore aggiornato
  let marginUpdate = {}
  if (typeof operatorCostEstimate === 'number') {
    const inquiry = await prisma.inquiry.findUnique({ where: { id }, select: { clientQuoteEstimate: true } })
    if (inquiry) {
      const margin = inquiry.clientQuoteEstimate - operatorCostEstimate
      const marginPct = inquiry.clientQuoteEstimate > 0
        ? Math.round((margin / inquiry.clientQuoteEstimate) * 1000) / 10
        : 0
      marginUpdate = { marginEstimate: Math.max(0, margin), marginPercent: marginPct }
    }
  }

  const updated = await prisma.inquiry.update({
    where: { id },
    data: {
      ...(pipelineStatus ? { pipelineStatus } : {}),
      ...(internalNotes !== undefined ? { internalNotes } : {}),
      ...(nextFollowUpAt ? { nextFollowUpAt: new Date(nextFollowUpAt) } : {}),
      ...(typeof operatorCostEstimate === 'number' ? { operatorCostEstimate } : {}),
      ...(typeof marginRealized === 'number' ? { marginRealized } : {}),
      ...marginUpdate,
    },
  })

  return Response.json({ success: true, inquiry: updated })
}
