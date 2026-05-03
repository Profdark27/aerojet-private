import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.role !== 'BROKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        operationalTasks: true,
        documents: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        departureDate: 'asc',
      },
      where: {
        status: {
          in: ['CONFIRMED', 'OPERATIONAL', 'COMPLETED']
        }
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Failed to fetch operations data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
