import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { whatsapp } from '@/lib/vendors/whatsapp'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.role !== 'BROKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let bookingId: string | undefined

  try {
    const body = await req.json()
    bookingId = body.bookingId
    const { 
      messageType, 
      to, 
      previewOnly = false,
      driverData,
      flightData,
      documentData
    } = body

    if (!bookingId) return NextResponse.json({ error: 'bookingId missing' }, { status: 400 })

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    })

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const recipientPhone = to || booking.user?.phone || ''
    const clientName = booking.user?.name || 'Cliente'
    const route = `${booking.fromCity} → ${booking.toCity}`

    let messageBody = ''

    switch (messageType) {
      case 'PASSENGER_UPDATE':
        messageBody = whatsapp.buildPassengerUpdateMessage(clientName, route, booking.flightStatus)
        break
      case 'DRIVER_DETAILS':
        if (!driverData) return NextResponse.json({ error: 'driverData missing' }, { status: 400 })
        messageBody = whatsapp.buildDriverDetailsMessage(clientName, driverData.name, driverData.phone, driverData.car)
        break
      case 'FLIGHT_READY':
        messageBody = `✦ AeroJet: Velivolo pronto all'FBO di ${booking.fromCity}. Il personale di terra La attende.`
        break
      case 'DOCUMENTS_REQUEST':
        messageBody = `✦ AeroJet: Gentile ${clientName}, la preghiamo di completare il caricamento dei documenti di viaggio nel Suo portale dedicato.`
        break
      case 'CATERING_CONFIRMED':
        messageBody = `✦ AeroJet: Il Suo menu personalizzato per il volo ${route} è stato confermato con i nostri chef.`
        break
      default:
        return NextResponse.json({ error: 'Invalid messageType' }, { status: 400 })
    }

    if (previewOnly) {
      return NextResponse.json({ 
        preview: true, 
        to: recipientPhone, 
        body: messageBody,
        readyToSend: !!recipientPhone
      })
    }

    if (!recipientPhone) {
      return NextResponse.json({ error: 'Recipient phone missing' }, { status: 400 })
    }

    const result = await whatsapp.sendMessage({ to: recipientPhone, body: messageBody })
    
    logger.messaging('SUCCESS', { 
      message: 'WhatsApp sent from API', 
      data: { to: recipientPhone, bookingId, messageType } 
    })

    return NextResponse.json(result)
  } catch (error: any) {
    logger.messaging('FAILED', { 
      message: 'WhatsApp API failed', 
      error: error.message,
      data: { bookingId } 
    })
    return NextResponse.json({ error: error.message || 'Failed to send WhatsApp message' }, { status: 500 })
  }
}
