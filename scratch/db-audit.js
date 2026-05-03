const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const counts = {
      users: await prisma.user.count(),
      inquiries: await prisma.inquiry.count(),
      bookings: await prisma.booking.count(),
      tasks: await prisma.operationalTask.count(),
    }
    console.log('DATABASE_COUNTS:', JSON.stringify(counts))
  } catch (err) {
    console.error('DATABASE_ERROR:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
