import { stripe } from '@/lib/stripe'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ error: 'Method Not Allowed' }, { status: 405 })
}

async function createOperationalTasks(bookingId: string) {
  // Idempotency check: don't create tasks if they already exist for this booking
  const existingCount = await prisma.operationalTask.count({
    where: { bookingId }
  })
  
  if (existingCount > 0) {
    console.log(`Operational tasks already exist for booking ${bookingId}, skipping creation.`)
    return
  }

  const tasks = [
    { 
      title: 'Conferma Aircraft & Tail Number', 
      category: 'FLIGHT', 
      priority: 'URGENT', 
      description: 'Verificare disponibilità finale del velivolo, equipaggio e slot aeroportuali.',
      vendorName: 'Operator Principal'
    },
    { 
      title: 'Raccolta Documenti & Manifest', 
      category: 'DOCUMENTS', 
      priority: 'HIGH', 
      description: 'Richiedere copie passaporti, visti e compilare il Passenger Manifest ufficiale.',
      isClientVisible: true
    },
    { 
      title: 'Prenotazione Catering Premium', 
      category: 'CATERING', 
      priority: 'NORMAL', 
      description: 'Coordinare menu con fornitore locale o FBO. Verificare allergie.',
      vendorName: 'Gourmet Aviation'
    },
    { 
      title: 'Coordinamento Transfer Partenza', 
      category: 'TRANSFER', 
      priority: 'NORMAL', 
      description: 'Prenotazione NCC per pickup cliente al domicilio/ufficio.',
      vendorName: 'Luxury Chauffeur Service'
    },
    { 
      title: 'Coordinamento Transfer Arrivo', 
      category: 'TRANSFER', 
      priority: 'NORMAL', 
      description: 'Prenotazione NCC per drop-off alla destinazione finale.',
      vendorName: 'Destination Elite Transports'
    },
    { 
      title: 'Check Concierge & Benvenuto', 
      category: 'CLIENT', 
      priority: 'NORMAL', 
      description: 'Chiamata di benvenuto e verifica preferenze speciali del cliente.',
      isClientVisible: true
    },
    { 
      title: 'Setup Interno & Margini', 
      category: 'INTERNAL', 
      priority: 'LOW', 
      description: 'Verifica finale margini operatore e chiusura pratica amministrativa.'
    },
  ]

  try {
    await Promise.all(tasks.map(task => 
      prisma.operationalTask.create({
        data: {
          bookingId,
          ...task,
          status: 'PENDING',
        }
      })
    ))
    console.log(`Created ${tasks.length} rich operational tasks for booking ${bookingId}`)
  } catch (err) {
    console.error(`Failed to create operational tasks for ${bookingId}:`, err)
  }
}

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

  // Primary lookup by inquiryId from metadata
  let inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: {
      id: true, userId: true, name: true, email: true,
      fromCity: true, toCity: true, flightDate: true,
      pax: true, clientQuoteEstimate: true, marginEstimate: true,
      optimizedQuote: true, pipelineStatus: true, depositPaid: true,
    },
  })

  // Fallback: find by stripeSessionId if primary lookup failed
  if (!inquiry) {
    inquiry = await prisma.inquiry.findUnique({
      where: { stripeSessionId: session.id },
      select: {
        id: true, userId: true, name: true, email: true,
        fromCity: true, toCity: true, flightDate: true,
        pax: true, clientQuoteEstimate: true, marginEstimate: true,
        optimizedQuote: true, pipelineStatus: true, depositPaid: true,
      },
    })
  }

  if (!inquiry) {
    console.error('handleInquiryDeposit: inquiry not found', { inquiryId, sessionId: session.id })
    return null
  }

  // Idempotency guard: already processed
  if (inquiry.depositPaid) {
    console.log('handleInquiryDeposit: already paid, skipping', inquiry.id)
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

  // Atomic transaction: update Inquiry + create Booking
  const booking = await prisma.$transaction(async (tx) => {
    // Race condition guard: re-check inside transaction
    const alreadyBooked = await tx.booking.findFirst({
      where: { stripeSessionId: session.id },
      select: { id: true, confirmationCode: true },
    })
    if (alreadyBooked) return alreadyBooked

    await tx.inquiry.update({
      where: { id: inquiry!.id },
      data: {
        depositPaid: true,
        depositAmount,
        depositPaidAt: new Date(),
        stripeSessionId: session.id,
        pipelineStatus: inquiry!.pipelineStatus === 'NEW' || inquiry!.pipelineStatus === 'CONTACTED'
          ? 'QUOTING'
          : inquiry!.pipelineStatus,
      },
    })

    return tx.booking.create({
      data: {
        userId: inquiry!.userId ?? undefined,
        fromCity: inquiry!.fromCity ?? 'N/D',
        toCity: inquiry!.toCity ?? 'N/D',
        departureDate,
        pax: inquiry!.pax ?? 1,
        status: 'CONFIRMED',
        totalPrice: totalPrice > 0 ? totalPrice : (inquiry!.optimizedQuote || inquiry!.clientQuoteEstimate),
        commission: inquiry!.marginEstimate,
        stripeSessionId: session.id,
        depositAmount,
        depositPaid: true,
        depositPaidAt: new Date(),
        confirmationCode,
        notes: `Creato da inquiry ${inquiry!.id}. Pagante: ${inquiry!.name} <${inquiry!.email}>`,
      },
    })
  })

  // Trigger AI Operations: Create initial tasks
  void createOperationalTasks(booking.id)

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
    console.error('handleBookingDeposit: booking not found', bookingId)
    return null
  }

  // Idempotency guard: already paid
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

  // Trigger AI Operations: Create initial tasks
  void createOperationalTasks(bookingId)

  return { confirmationCode }
}

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook missing stripe-signature or STRIPE_WEBHOOK_SECRET not set')
    return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  // Read raw body as Buffer (required for signature verification)
  const rawBody = await request.arrayBuffer()
  const body = Buffer.from(rawBody)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        try {
          const quoteId = session.metadata?.quoteId
          const inquiryId = session.metadata?.inquiryId

          logger.payment('SUCCESS', { 
            message: 'Checkout session completed', 
            data: { sessionId: session.id, quoteId, inquiryId } 
          })
        } catch (e) {
          console.error('Error logging payment success', e)
        }

        const meta = (session.metadata ?? {}) as Record<string, string>

        let confirmationCode: string | null = null
        let bookingId: string | undefined
        let fromCity = meta.from_city || ''
        let toCity = meta.to_city || ''
        const depositAmount = parseInt(meta.deposit || '0')
        const totalPrice = parseInt(meta.total_price || '0')
        const customerName = meta.customer_name || session.customer_details?.name || 'Cliente'

        console.log('checkout.session.completed', { sessionId: session.id, meta })

        // Inquiry deposit flow (quote-based checkout)
        if (meta.inquiry_id) {
          const result = await handleInquiryDeposit(session, meta)
          if (result) {
            confirmationCode = result.confirmationCode
            bookingId = result.booking.id
            fromCity = result.inquiry.fromCity ?? fromCity
            toCity = result.inquiry.toCity ?? toCity
          }
        }

        // Booking deposit flow
        else if (meta.booking_id) {
          const result = await handleBookingDeposit(session, meta)
          if (result) {
            confirmationCode = result.confirmationCode
            bookingId = meta.booking_id
          }
        }

        // Legacy / unknown flow
        else {
          confirmationCode = `AJ-${session.id.slice(-6).toUpperCase()}`
        }

        // Send confirmation email to client
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
              bookingId,
            })
          } catch (err) {
            console.error('Email confirmation failed (non-fatal):', err)
          }
        }

        // Broker notifications — fire-and-forget
        void Promise.allSettled([
          import('@/app/api/notifications/route').then(({ pushNotification }) =>
            pushNotification('deposit_received', {
              clientName: customerName,
              route: fromCity && toCity ? `${fromCity} → ${toCity}` : 'N/D',
              depositAmount,
              totalPrice,
              inquiryId: meta.inquiry_id || null,
              confirmationCode: confirmationCode ?? '',
              ts: Date.now(),
            })
          ).catch(() => {}),
          process.env.BROKER_EMAIL
            ? import('@/lib/email').then(({ sendBrokerDepositReceived }) =>
                sendBrokerDepositReceived({
                  brokerEmail: process.env.BROKER_EMAIL!,
                  clientName: customerName,
                  clientEmail: session.customer_email ?? '',
                  from: fromCity || 'N/D',
                  dest: toCity || 'N/D',
                  flightDate: meta.flight_date || 'Da definire',
                  depositAmount,
                  totalPrice,
                  confirmationCode: confirmationCode ?? `AJ-${session.id.slice(-6).toUpperCase()}`,
                  inquiryId: meta.inquiry_id || session.id,
                })
              ).catch(err => console.error('Broker deposit email failed (non-fatal):', err))
            : Promise.resolve(),
        ])

        break
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        console.warn('payment_intent.payment_failed:', intent.id)
        break
      }

      default:
        // Always return 200 for unhandled events to prevent Stripe retries
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    // Still return 200 — Stripe retries on non-2xx, so a crash here would cause infinite retries
  }

  return Response.json({ received: true })
}
