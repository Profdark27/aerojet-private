import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { stripe, calcDeposit, calcCommission, DEPOSIT_RATE } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { quoteId } = await req.json()

    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId mancante' }, { status: 400 })
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { inquiry: true }
    })

    if (!quote || !quote.inquiry) {
      return NextResponse.json({ error: 'Preventivo non trovato' }, { status: 404 })
    }

    if (quote.inquiry.depositPaid) {
      return NextResponse.json({ error: 'Deposito già pagato per questo preventivo' }, { status: 409 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const depositAmount = calcDeposit(quote.price)
    const fromCity = quote.inquiry.fromCity || 'N/D'
    const toCity = quote.inquiry.toCity || 'N/D'
    const flightDate = quote.inquiry.flightDate || 'Da definire'

    // Mock Mode fallback
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_0')) {
      const mockSessionId = `mock_${Date.now()}`
      await prisma.inquiry.update({
        where: { id: quote.inquiryId! },
        data: { stripeSessionId: mockSessionId },
      })
      
      // Track started
      fetch(new URL('/api/track', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'checkout_started',
          metadata: { quoteId: quote.id, sessionId: mockSessionId, mock: true }
        })
      }).catch(() => {})
      
      return NextResponse.json({
        url: `${origin}/booking/success?mock=true&from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&deposit=${depositAmount}&ref=${quote.id}`,
        sessionId: mockSessionId,
        depositAmount,
        totalAmount: quote.price,
        mock: true,
      })
    }

    // Real Stripe Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: quote.inquiry.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `✦ Deposito Volo Privato — ${fromCity} → ${toCity}`,
              description: [
                `Deposito ${Math.round(DEPOSIT_RATE * 100)}% · ${flightDate}`,
                `Velivolo: ${quote.aircraftModel}`,
                `Valore totale: €${quote.price.toLocaleString('it-IT')}`,
                `Saldo residuo: €${(quote.price - depositAmount).toLocaleString('it-IT')} (dovuto 72h prima del volo)`,
              ].join(' · '),
            },
            unit_amount: Math.round(depositAmount * 100), // in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'flight_deposit',
        quote_id: quote.id,
        inquiry_id: quote.inquiryId,
        from_city: fromCity,
        to_city: toCity,
        flight_date: flightDate,
        total_price: String(quote.price),
        deposit: String(depositAmount),
        customer_name: quote.inquiry.name,
        aircraft_model: quote.aircraftModel
      },
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/accept-quote/${quote.id}`,
      payment_intent_data: {
        description: `Aerojet Private — Deposito Preventivo ${quote.id}`,
        metadata: {
          quote_id: quote.id,
          inquiry_id: quote.inquiryId,
          customer_name: quote.inquiry.name,
        },
      },
    })

    // Save sessionId on the inquiry
    await prisma.inquiry.update({
      where: { id: quote.inquiryId! },
      data: { stripeSessionId: stripeSession.id },
    })

    // Track started
    fetch(new URL('/api/track', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'checkout_started',
        metadata: { quoteId: quote.id, sessionId: stripeSession.id }
      })
    }).catch(() => {})

    return NextResponse.json({
      url: stripeSession.url,
      sessionId: stripeSession.id,
    })
  } catch (error: any) {
    console.error('Errore creazione checkout preventivo:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
