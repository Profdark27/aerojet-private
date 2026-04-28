import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { stripe, calcDeposit, calcCommission, DEPOSIT_RATE } from '@/lib/stripe'

// POST /api/checkout/deposit
// Body: { inquiryId?, bookingId?, customerEmail?, customerName? }
// Auth: BROKER | ADMIN
// Returns: { url, sessionId, depositAmount, totalAmount, mock? }

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['BROKER', 'ADMIN'].includes(session.user.role)) {
    return Response.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: 'Formato non valido' }, { status: 400 })
  }

  const { inquiryId, bookingId, customerEmail, customerName } = body as {
    inquiryId?: string
    bookingId?: string
    customerEmail?: string
    customerName?: string
  }

  if (!inquiryId && !bookingId) {
    return Response.json({ error: 'inquiryId o bookingId richiesto' }, { status: 400 })
  }

  const origin = request.headers.get('origin') || 'http://localhost:3000'

  // ── Load source record ──────────────────────────────────────────
  let totalAmount: number
  let email: string
  let name: string
  let fromCity: string
  let toCity: string
  let flightDate: string
  let metaType: 'inquiry' | 'booking'
  let metaId: string

  if (inquiryId) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      select: {
        id: true, name: true, email: true,
        fromCity: true, toCity: true, flightDate: true,
        clientQuoteEstimate: true, optimizedQuote: true,
        depositPaid: true, pipelineStatus: true,
      },
    })
    if (!inquiry) return Response.json({ error: 'Inquiry non trovata' }, { status: 404 })
    if (inquiry.depositPaid) return Response.json({ error: 'Deposito già pagato per questa richiesta' }, { status: 409 })

    totalAmount = inquiry.optimizedQuote > 0 ? inquiry.optimizedQuote : inquiry.clientQuoteEstimate
    if (totalAmount <= 0) {
      return Response.json({ error: 'Nessun importo quotato su questa richiesta — inserire clientQuoteEstimate o optimizedQuote' }, { status: 422 })
    }

    email = customerEmail || inquiry.email
    name = customerName || inquiry.name
    fromCity = inquiry.fromCity || 'N/D'
    toCity = inquiry.toCity || 'N/D'
    flightDate = inquiry.flightDate || 'Da definire'
    metaType = 'inquiry'
    metaId = inquiry.id

  } else {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId! },
      select: {
        id: true, fromCity: true, toCity: true, departureDate: true,
        totalPrice: true, depositPaid: true, pax: true,
        user: { select: { email: true, name: true } },
      },
    })
    if (!booking) return Response.json({ error: 'Booking non trovato' }, { status: 404 })
    if (booking.depositPaid) return Response.json({ error: 'Deposito già pagato per questo booking' }, { status: 409 })
    if (!booking.totalPrice || booking.totalPrice <= 0) {
      return Response.json({ error: 'Nessun importo su questo booking' }, { status: 422 })
    }

    totalAmount = booking.totalPrice
    email = customerEmail || booking.user?.email || ''
    name = customerName || booking.user?.name || 'Cliente'
    fromCity = booking.fromCity
    toCity = booking.toCity
    flightDate = new Date(booking.departureDate).toLocaleDateString('it-IT')
    metaType = 'booking'
    metaId = booking.id
  }

  const depositAmount = calcDeposit(totalAmount)
  const commission = calcCommission(totalAmount)

  // ── Dev mock (no Stripe key) ─────────────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_0')) {
    // Save sessionId placeholder so we can test the rest of the flow
    const mockSessionId = `mock_${Date.now()}`
    if (metaType === 'inquiry') {
      await prisma.inquiry.update({
        where: { id: metaId },
        data: { stripeSessionId: mockSessionId },
      })
    } else {
      await prisma.booking.update({
        where: { id: metaId },
        data: { stripeSessionId: mockSessionId },
      })
    }
    return Response.json({
      url: `${origin}/booking/success?mock=true&from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&deposit=${depositAmount}&ref=${metaId}`,
      sessionId: mockSessionId,
      depositAmount,
      totalAmount,
      mock: true,
    })
  }

  // ── Real Stripe session ──────────────────────────────────────────
  try {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `✦ Deposito Volo Privato — ${fromCity} → ${toCity}`,
              description: [
                `Deposito ${Math.round(DEPOSIT_RATE * 100)}% · ${flightDate}`,
                `Valore totale stimato: €${totalAmount.toLocaleString('it-IT')}`,
                `Saldo residuo: €${(totalAmount - depositAmount).toLocaleString('it-IT')} (dovuto 72h prima del volo)`,
              ].join(' · '),
            },
            unit_amount: Math.round(depositAmount * 100), // centesimi
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'flight_deposit',
        [`${metaType}_id`]: metaId,
        from_city: fromCity,
        to_city: toCity,
        flight_date: flightDate,
        total_price: String(totalAmount),
        deposit: String(depositAmount),
        customer_name: name,
      },
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/search`,
      payment_intent_data: {
        description: `Aerojet Private — Deposito ${fromCity} → ${toCity}`,
        metadata: {
          [`${metaType}_id`]: metaId,
          customer_name: name,
        },
      },
      custom_text: {
        submit: { message: 'Il saldo restante sarà dovuto 72 ore prima del volo.' },
      },
    })

    // Salva stripeSessionId immediatamente (pre-payment)
    if (metaType === 'inquiry') {
      await prisma.inquiry.update({
        where: { id: metaId },
        data: { stripeSessionId: stripeSession.id },
      })
    } else {
      await prisma.booking.update({
        where: { id: metaId },
        data: { stripeSessionId: stripeSession.id },
      })
    }

    return Response.json({
      url: stripeSession.url,
      sessionId: stripeSession.id,
      depositAmount,
      totalAmount,
    })
  } catch (err) {
    console.error('Stripe deposit error:', err)
    return Response.json({ error: 'Errore inizializzazione pagamento' }, { status: 500 })
  }
}
