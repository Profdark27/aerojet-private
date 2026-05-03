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
      where: {
        status: { in: ['CONFIRMED', 'OPERATIONAL'] }
      },
      include: {
        operationalTasks: true,
        documents: true,
        user: { select: { name: true } }
      }
    })

    const insights = []
    const alerts = []

    for (const booking of bookings) {
      const daysToDeparture = Math.ceil((booking.departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      // 1. Check for missing Tail Number
      if (!booking.tailNumber && daysToDeparture <= 3) {
        alerts.push({
          id: `tail-${booking.id}`,
          type: 'CRITICAL',
          message: `Volo ${booking.fromCity}→${booking.toCity} tra ${daysToDeparture} giorni: Tail Number ancora non assegnato.`,
          bookingId: booking.id
        })
      }

      // 2. Check for missing Documents
      const missingDocs = booking.operationalTasks.filter(t => t.category === 'DOCUMENTS' && t.status !== 'COMPLETED')
      if (missingDocs.length > 0 && daysToDeparture <= 2) {
        alerts.push({
          id: `docs-${booking.id}`,
          type: 'WARNING',
          message: `${booking.user?.name || 'Cliente'} non ha ancora completato i documenti per il volo del ${booking.departureDate.toLocaleDateString('it-IT')}.`,
          bookingId: booking.id
        })
        insights.push(`Ho preparato un sollecito WhatsApp per ${booking.user?.name || 'il cliente'} riguardo i documenti mancanti per la rotta ${booking.fromCity}→${booking.toCity}.`)
      }

      // 3. Check for Catering
      const cateringTask = booking.operationalTasks.find(t => t.category === 'CATERING')
      if (cateringTask && cateringTask.status === 'PENDING' && daysToDeparture <= 5) {
        insights.push(`Suggerisco di inviare il menu stagionale a ${booking.user?.name || 'cliente'} per il volo da ${booking.fromCity}.`)
      }

      // 4. Ground Transfer
      const transferTasks = booking.operationalTasks.filter(t => t.category === 'TRANSFER' && t.status === 'PENDING')
      if (transferTasks.length > 0) {
        insights.push(`Disponibili nuovi preventivi NCC per il drop-off a ${booking.toCity}. Vuole che li associ al volo ${booking.confirmationCode}?`)
      }
    }

    // Default insight if none generated
    if (insights.length === 0) {
      insights.push("Tutte le operazioni procedono secondo i protocolli. Nessuna azione urgente richiesta dal sistema AI.")
    }

    return NextResponse.json({
      alerts: alerts.slice(0, 5),
      insights: insights.slice(0, 3),
      agentStatus: [
        { name: 'Concierge', status: 'Online', color: 'bg-green-500' },
        { name: 'Operations', status: 'Monitoring Feed', color: 'bg-[#C9A84C]' },
        { name: 'Booking Auditor', status: 'Idle', color: 'bg-white/20' }
      ]
    })
  } catch (error) {
    console.error('AI Insights Error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
