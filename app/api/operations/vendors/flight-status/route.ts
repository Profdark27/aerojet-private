import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aviation } from '@/lib/vendors/aviation'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.role !== 'BROKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { tailNumber, bookingId } = await req.json()
    if (!tailNumber) {
      return NextResponse.json({ error: 'Tail number is required' }, { status: 400 })
    }

    const status = await aviation.getFlightStatus(tailNumber)
    
    if (!status) {
      return NextResponse.json({ error: 'Flight status not found' }, { status: 404 })
    }

    // Persist status to database if bookingId is provided
    if (bookingId) {
      const prisma = (await import('@/lib/prisma')).default
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          flightStatus: status.status,
          actualDepartureTime: status.actualDeparture || undefined,
          actualArrivalTime: status.actualArrival || undefined,
          tailNumber: status.tailNumber || tailNumber,
        }
      })
    }

    return NextResponse.json(status)
  } catch (error: any) {
    console.error('[API/FlightStatus] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch flight status' }, { status: 500 })
  }
}
