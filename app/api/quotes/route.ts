import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
    // Auth guard — solo broker/admin
  const session = await auth()
    if (!session?.user || !['BROKER', 'ADMIN'].includes(session.user.role)) {
          return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

  try {
        const now = new Date()
        const quotes = await prisma.quote.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                          inquiry: {
                                      select: {
                                                    id: true, name: true, email: true,
                                                    fromCity: true, toCity: true, flightDate: true, pax: true,
                                                    depositPaid: true, pipelineStatus: true,
                                      },
                          },
                },
        })

      const result = quotes.map((q) => {
              let status: string
              if (q.inquiry?.depositPaid) {
                        status = 'ACCEPTED'
              } else if (q.validUntil < now) {
                        status = 'EXPIRED'
              } else {
                        status = q.status
              }
              return {
                        id: q.id,
                        client: q.inquiry?.name ?? '—',
                        clientEmail: q.inquiry?.email ?? '',
                        fromCity: q.inquiry?.fromCity ?? '—',
                        toCity: q.inquiry?.toCity ?? '—',
                        flightDate: q.inquiry?.flightDate ?? '',
                        pax: q.inquiry?.pax ?? 1,
                        aircraft: q.aircraftModel,
                        operator: q.operatorName,
                        price: q.price,
                        currency: q.currency,
                        commission: q.commission ?? 0,
                        validUntil: q.validUntil.toISOString(),
                        createdAt: q.createdAt.toISOString(),
                        status,
                        inquiryId: q.inquiryId,
              }
      })

      return NextResponse.json({ quotes: result })
  } catch (error) {
        console.error('GET /api/quotes error:', error)
        return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
    // Auth guard — solo broker/admin
  const session = await auth()
    if (!session?.user || !['BROKER', 'ADMIN'].includes(session.user.role)) {
          return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

  try {
        const data = await req.json()
        const { inquiryId, client, from, to, jet, totalPrice, commission } = data

      if (!inquiryId || !client || !from || !to || !jet || !totalPrice) {
              return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 })
      }

      const validUntil = new Date()
        validUntil.setDate(validUntil.getDate() + 5)

      const quote = await prisma.$transaction(async (tx) => {
              const newQuote = await tx.quote.create({
                        data: {
                                    inquiryId,
                                    operatorName: 'Aerojet Network',
                                    aircraftModel: jet.model || 'Unknown Jet',
                                    price: totalPrice,
                                    commission: commission,
                                    validUntil,
                                    status: 'PENDING',
                        },
              })
              await tx.inquiry.update({
                        where: { id: inquiryId },
                        data: { pipelineStatus: 'QUOTED' },
              })
              return newQuote
      })

      const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } })
        if (inquiry && inquiry.email) {
                try {
                          const { sendQuoteToClient } = await import('@/lib/email')
                          await sendQuoteToClient({
                                      to: inquiry.email,
                                      name: inquiry.name,
                                      aircraft: jet.model || 'Volo Privato',
                                      from: inquiry.fromCity || from,
                                      dest: inquiry.toCity || to,
                                      date: inquiry.flightDate || 'Data da definire',
                                      pax: inquiry.pax || 1,
                                      price: totalPrice,
                                      validUntil: validUntil.toLocaleDateString('it-IT'),
                                      brokerName: session.user.name || 'Il tuo Broker',
                                      quoteId: quote.id,
                          })
                } catch (emailErr) {
                          console.error('Email confirmation failed (non-fatal):', emailErr)
                }
        }

      return NextResponse.json({ success: true, quote })
  } catch (error) {
        console.error('Errore creazione preventivo:', error)
        return NextResponse.json(
          { error: 'Errore interno durante il salvataggio del preventivo.' },
          { status: 500 }
              )
  }
}
