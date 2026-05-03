const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const booking = await prisma.booking.findFirst({
    select: { id: true }
  })
  if (booking) {
    console.log(`BOOKING_ID:${booking.id}`)
  } else {
    console.log('NO_BOOKING_FOUND')
  }
  await prisma.$disconnect()
}

main()
