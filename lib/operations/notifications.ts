import { whatsapp } from '@/lib/vendors/whatsapp'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function notifyClientOfTaskUpdate(taskId: string) {
  try {
    const task = await prisma.operationalTask.findUnique({
      where: { id: taskId },
      include: {
        booking: {
          include: {
            user: true
          }
        }
      }
    })

    if (!task || !task.isClientVisible || !task.booking.user?.phone) return

    const clientName = task.booking.user.name || 'Cliente'
    const phone = task.booking.user.phone
    const route = `${task.booking.fromCity} → ${task.booking.toCity}`
    const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/trip/${task.bookingId}`

    let message = ''

    // Logic based on category and status
    if (task.category === 'TRANSFER' && task.vendorName && task.vendorContact && task.status === 'IN_PROGRESS') {
      message = whatsapp.buildDriverDetailsMessage(clientName, task.vendorName, task.vendorContact, 'Vettura assegnata')
    } else if (task.category === 'FLIGHT' && task.status === 'COMPLETED') {
      message = whatsapp.buildFlightReadyMessage(clientName, task.booking.tailNumber || 'N/D', task.booking.handlingAgentFrom || 'FBO')
    } else if (task.category === 'DOCUMENTS' && task.status === 'PENDING') {
      message = whatsapp.buildDocumentsRequestMessage(clientName, portalUrl)
    } else if (task.category === 'CATERING' && task.status === 'COMPLETED') {
      message = whatsapp.buildCateringConfirmedMessage(clientName, route)
    }

    if (message) {
      await whatsapp.sendMessage({ to: phone, body: message })
      logger.messaging('SUCCESS', { 
        message: 'WhatsApp sent', 
        data: { phone, taskId, category: task.category } 
      })
    }
  } catch (error: any) {
    logger.messaging('FAILED', { 
      message: 'WhatsApp send failed', 
      error: error.message,
      data: { taskId } 
    })
  }
}
