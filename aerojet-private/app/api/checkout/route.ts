import { stripe, calcDeposit, calcCommission } from '@/lib/stripe'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { aircraft, from, to, date, pax, customerEmail } = body

    if (!aircraft || !from || !to) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const totalPrice = aircraft.price
    const deposit = calcDeposit(totalPrice)
    const commission = calcCommission(totalPrice)

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Check Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      // Return mock session for development
      return Response.json({
        url: `${origin}/booking/success?mock=true&aircraft=${encodeURIComponent(aircraft.model)}&from=${from}&to=${to}&deposit=${deposit}`,
        mock: true,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `✦ ${aircraft.model} — ${from} → ${to}`,
              description: `Deposito 30% · ${date} · ${pax} passeggeri · Volo privato completo €${totalPrice.toLocaleString('it-IT')}`,
              metadata: {
                category: aircraft.category,
                operator: aircraft.operator,
              },
            },
            unit_amount: deposit * 100, // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'flight_deposit',
        aircraft_model: aircraft.model,
        aircraft_category: aircraft.category,
        operator: aircraft.operator,
        from_city: from,
        to_city: to,
        flight_date: date,
        pax: String(pax),
        total_price: String(totalPrice),
        deposit: String(deposit),
        commission: String(commission),
      },
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/search`,
      payment_intent_data: {
        description: `Aerojet Private — Deposito volo ${from} → ${to}`,
      },
      custom_text: {
        submit: { message: 'Il saldo restante sarà dovuto 72h prima del volo.' },
      },
    })

    return Response.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Stripe error:', err)
    return Response.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}
