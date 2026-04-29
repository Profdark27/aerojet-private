import { auth } from '@/lib/auth'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import ProfileClient from './ProfileClient'

export const metadata = {
  title: 'Area Personale | Aerojet',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 36, color: '#C9A84C' }}>✦</div>
        <p style={{ color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>Accesso richiesto</p>
        <Link href="/login" className="btn-gold" style={{ padding: '12px 32px', textDecoration: 'none' }}>ACCEDI</Link>
      </div>
    )
  }

  const userId = session.user.id
  const userEmail = session.user.email

  // Fetch inquiries with their quotes
  const inquiries = await prisma.inquiry.findMany({
    where: {
      OR: [
        { userId },
        ...(userEmail ? [{ email: userEmail }] : [])
      ]
    },
    include: {
      quotes: {
        select: {
          id: true,
          operatorName: true,
          aircraftModel: true,
          price: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Fetch bookings for the user
  const bookings = await prisma.booking.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format data for the client component
  const formattedInquiries = inquiries.map(inq => ({
    id: inq.id,
    fromCity: inq.fromCity,
    toCity: inq.toCity,
    flightDate: inq.flightDate,
    status: inq.status,
    quotes: inq.quotes.map(q => ({
      id: q.id,
      operatorName: q.operatorName,
      aircraftModel: q.aircraftModel,
      price: q.price,
      status: q.status
    }))
  }))

  const formattedBookings = bookings.map(bk => ({
    id: bk.id,
    fromCity: bk.fromCity,
    toCity: bk.toCity,
    departureDate: bk.departureDate,
    jetCategory: bk.jetCategory,
    totalPrice: bk.totalPrice,
    status: bk.status,
    confirmCode: bk.confirmationCode,
    depositPaid: bk.depositPaid
  }))

  const sessionUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role
  }

  return (
    <ProfileClient 
      sessionUser={sessionUser}
      inquiries={formattedInquiries}
      bookings={formattedBookings}
    />
  )
}
