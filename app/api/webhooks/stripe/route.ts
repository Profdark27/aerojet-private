import { stripe } from '@/lib/stripe'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I
  let code = 'AJ-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

async function getUniqueConfirmationCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateConfirmationCode()
    const exists = await prisma.booking.findUnique({ where: { confirmationCode: code }, select: { id: true } })
    if (!exists) return code
  }
  // Fallback with timestamp to guarantee uniqueness
  return `AJ-${Date.now().toString(36).toUpperCase().slice(-6)}`
}

async function handleInquiryDeposit(session: Stripe.Checkout.Session, meta: Record<string, string>) {
  const inquiryId = meta.inquiry_id
  const depositAmount = parseFloat(meta.deposit || '0')
  const totalPrice = parseFloat(meta.total_price || '0')

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: {
      id: true, userId: true, name: true, email: true,
      fromCity: true, toCity: true, flightDate: true,
      pax: true, clientQuoteEstimate: true, marginEstimate: true,
      optimizedQuote: true, pipelineStatus: true, depositPaid: true,
    },
  })
  if (!inquiry) {
    console.warn('handleInquiryDeposit: inquiry not found', inquiryId)
    return null
  }

  // Idempotency: session already processed
  if (inquiry.depositPaid) {
    const existingBooking = await prisma.booking.findFirst({
      where: { stripeSessionId: session.id },
      select: { id: true, confirmationCode: true },
    })
    return {
      booking: existingBooking ?? { id: '', confirmationCode: null },
      confirmationCode: existingBooking?.confirmationCode ?? `AJ-${session.id.slice(-6).toUpperCase()}`,
      inquiry,
    }
  }

  const confirmationCode = await getUniqueConfirmationCode()

  // Parse departure date from flightDate string
  let departureDate: Date
  try {
    const parsed = new Date(inquiry.flightDate || '')
    departureDate = isNaN(parsed.getTime()) ? new Date() : parsed
  } catch {
    departureDate = new Date()
  }

  // Transazione: aggiorna Inquiry + crea Booking
  const booking = await prisma.$transaction(async (tx) => {
    // Race condition guard: check again inside transaction
    const alreadyBooked = await tx.booking.findFirst({
      where: { stripeSessionId: session.id },
      select: { id: true, confirmationCode: true },
    })
    if (alreadyBooked) return alreadyBooked

    await tx.inquiry.update({
      where: { id: inquiryId },
      data: {
        depositPaid: true,
        depositAmount,
        depositPaidAt: new Date(),
        stripeSessionId: session.id,
        pipelineStatus: inquiry.pipelineStatus === 'NEW' || inquiry.pipelineStatus === 'CONTACTED'
          ? 'QUOTING'
          : inquiry.pipelineStatus,
      },
    })

    return tx.booking.create({
      data: {
        userId: inquiry.userId ?? undefined,
        fromCity: inquiry.fromCity ?? 'N/D',
        toCity: inquiry.toCity ?? 'N/D',
        departureDate,
        pax: inquiry.pax ?? 1,
        status: 'CONFIRMED',
        totalPrice: totalPrice > 0 ? totalPrice : (inquiry.optimizedQuote || inquiry.clientQuoteEstimate),
        commission: inquiry.marginEstimate,
        stripeSessionId: session.id,
        depositAmount,
        depositPaid: true,
        depositPaidAt: new Date(),
        confirmationCode,
        notes: `Creato da inquiry ${inquiryId}. Pagante: ${inquiry.name} <${inquiry.email}>`,
      },
    })
  })

  return { booking, confirmationCode, inquiry }
}

async function handleBookingDeposit(session: Stripe.Checkout.Session, meta: Record<string, string>) {
  const bookingId = meta.booking_id
  const depositAmount = parseFloat(meta.deposit || '0')

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, confirmationCode: true, status: true, depositPaid: true },
  })
  if (!booking) {
    console.warn('handleBookingDeposit: booking not found', bookingId)
    return null
  }

  // Idempotency: already paid
  if (booking.depositPaid) {
    return { confirmationCode: booking.confirmationCode ?? `AJ-${session.id.slice(-6).toUpperCase()}` }
  }

  const confirmationCode = booking.confirmationCode ?? await getUniqueConfirmationCode()

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      depositPaid: true,
      depositAmount,
      depositPaidAt: new Date(),
      stripeSessionId: session.id,
      confirmationCode,
      status: 'CONFIRMED',
    },
  })

  return { confirmationCode }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('Webhook received (no signature check in dev)')
    return Response.json({ received: true })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const meta = (session.metadata ?? {}) as Record<string, string>

        let confirmationCode: string | null = null
        let fromCity = meta.from_city || ''
        let toCity = meta.to_city || ''
        const depositAmount = parseInt(meta.deposit || '0')
        const totalPrice = parseInt(meta.total_price || '0')
        const customerName = meta.customer_name || session.customer_details?.name || 'Cliente'

        // ── Inquiry deposit flow ──
        if (meta.inquiry_id) {
          const result = await handleInquiryDeposit(session, meta)
          if (result) {
            confirmationCode = result.confirmationCode
            fromCity = result.inquiry.fromCity ?? fromCity
            toCity = result.inquiry.toCity ?? toCity
          }
        }

        // ── Booking deposit flow ──
        else if (meta.booking_id) {
          const result = await handleBookingDeposit(session, meta)
          if (result) confirmationCode = result.confirmationCode
        }

        // ── Legacy search flow (no DB link) ──
        else {
          confirmationCode = `AJ-${session.id.slice(-6).toUpperCase()}`
        }

        // ── Send confirmation email ──
        if (session.customer_email) {
          try {
            const { sendBookingConfirmation } = await import('@/lib/email')
            await sendBookingConfirmation({
              to: session.customer_email,
              name: customerName,
              aircraft: meta.aircraft_model || 'Volo Privato',
              from: fromCity,
              dest: toCity,
              date: meta.flight_date || '',
              pax: parseInt(meta.pax || '1'),
              deposit: depositAmount,
              total: totalPrice,
              confirmCode: confirmationCode ?? `AJ-${session.id.slice(-6).toUpperCase()}`,
            })
          } catch (err) {
            console.error('Email confirmation failed (non-fatal):', err)
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        console.warn('Payment failed:', intent.id)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Webhook handler error (non-fatal):', err)
  }

  return Response.json({ received: true })
}
