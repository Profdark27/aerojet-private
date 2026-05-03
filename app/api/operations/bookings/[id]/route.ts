import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'BROKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const data = await req.json()
    
    // Validation
    const validStatuses = ['SCHEDULED', 'CONFIRMED', 'TAXI', 'AIRBORNE', 'ARRIVED', 'CANCELLED']
    if (data.flightStatus && !validStatuses.includes(data.flightStatus)) {
      return NextResponse.json({ error: 'Stato volo non valido' }, { status: 400 })
    }

    const updateData: any = { updatedAt: new Date() }
    if (data.tailNumber !== undefined) updateData.tailNumber = data.tailNumber
    if (data.handlingAgentFrom !== undefined) updateData.handlingAgentFrom = data.handlingAgentFrom
    if (data.handlingAgentTo !== undefined) updateData.handlingAgentTo = data.handlingAgentTo
    if (data.flightStatus !== undefined) updateData.flightStatus = data.flightStatus

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData
    })

    logger.ops('SUCCESS', { 
      message: 'Booking manually updated', 
      data: { bookingId: id, updates: data } 
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    logger.ops('FAILED', { 
      message: 'Manual booking update failed', 
      error: error.message,
      data: { bookingId: id } 
    })
    return NextResponse.json({ error: 'Errore nell\'aggiornamento booking' }, { status: 500 })
  }
}
