import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        operationalTasks: {
          where: {
            isClientVisible: true
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            status: true,
            priority: true,
            vendorName: true, // Sometimes visible if it's "Luxury Chauffeur" etc.
            vendorContact: true,
            notesClient: true,
          }
        },
        documents: {
          select: {
            id: true,
            type: true,
            passengerName: true,
            fileUrl: true,
            status: true,
            notesClient: true,
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
    }

    // Filter sensitive internal data
    const clientSafeBooking = {
      id: booking.id,
      confirmationCode: booking.confirmationCode,
      fromCity: booking.fromCity,
      toCity: booking.toCity,
      departureDate: booking.departureDate,
      pax: booking.pax,
      status: booking.status,
      flightStatus: booking.flightStatus,
      tailNumber: booking.tailNumber,
      handlingAgentFrom: booking.handlingAgentFrom,
      handlingAgentTo: booking.handlingAgentTo,
      depositPaid: booking.depositPaid,
      actualDepartureTime: booking.actualDepartureTime,
      actualArrivalTime: booking.actualArrivalTime,
      operationalTasks: booking.operationalTasks,
      documents: (booking as any).documents || [],
      clientName: booking.user?.name || 'Ospite'
    }

    return NextResponse.json(clientSafeBooking)
  } catch (error) {
    console.error('Failed to fetch trip details:', error)
    return NextResponse.json({ error: 'Errore nel recupero dei dettagli del viaggio' }, { status: 500 })
  }
}
