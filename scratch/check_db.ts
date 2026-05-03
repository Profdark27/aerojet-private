import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkAll() {
  const inquiries = await prisma.inquiry.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
  const bookings = await prisma.booking.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
  console.log('--- DB CHECK ---')
  console.log('Recent Inquiries:', inquiries.map(i => i.name + ' ' + i.email + ' ' + i.createdAt))
  console.log('Recent Bookings:', bookings.map(b => b.id + ' ' + b.createdAt))
}

checkAll().catch(console.error)
