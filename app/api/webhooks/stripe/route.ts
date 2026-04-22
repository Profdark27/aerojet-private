import { stripe } from '@/lib/stripe'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    // Dev mode: log and accept
    console.log('⚠️  Webhook received (no signature check in dev)')
    return Response.json({ received: true })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const meta = session.metadata || {}
      const confirmCode = `AJ-${session.id.slice(-6).toUpperCase()}`

      console.log('✅ Payment completed:', { id: session.id, customer: session.customer_email })

      if (session.customer_email) {
        const { sendBookingConfirmation } = await import('@/lib/email')
        await sendBookingConfirmation({
          to: session.customer_email,
          name: session.customer_details?.name || 'Cliente',
          aircraft: meta.aircraft_model || '',
          from: meta.from_city || '',
          to: meta.to_city || '',
          date: meta.flight_date || '',
          pax: parseInt(meta.pax || '1'),
          deposit: parseInt(meta.deposit || '0'),
          total: parseInt(meta.total_price || '0'),
          confirmCode,
        })
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      console.log('❌ Payment failed:', intent.id)
      break
    }

    default:
      console.log(`Unhandled event: ${event.type}`)
  }

  return Response.json({ received: true })
}
