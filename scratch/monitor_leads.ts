import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function monitor() {
  console.log('--- MONITORAGGIO LIVE AEROJET ---')
  
  // Controlla nuovi Inquiry
  const recentInquiries = await prisma.inquiry.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 3600000) } // Ultima ora
    },
    orderBy: { createdAt: 'desc' }
  })
  
  // Controlla nuovi Booking
  const recentBookings = await prisma.booking.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 3600000) }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Controlla nuove Quote
  const recentQuotes = await prisma.quote.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 3600000) }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`Inquiries nell'ultima ora: ${recentInquiries.length}`)
  recentInquiries.forEach(i => console.log(`- Inquiry: ${i.name} (${i.email}) - ${i.createdAt}`))

  console.log(`\nBookings nell'ultima ora: ${recentBookings.length}`)
  recentBookings.forEach(b => console.log(`- Booking ID: ${b.id} (Status: ${b.status}) - ${b.createdAt}`))

  console.log(`\nQuotes nell'ultima ora: ${recentQuotes.length}`)
  recentQuotes.forEach(q => console.log(`- Quote ID: ${q.id} (Status: ${q.status}) - ${q.createdAt}`))
}

monitor().catch(console.error)
