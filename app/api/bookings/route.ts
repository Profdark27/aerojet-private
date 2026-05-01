import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/bookings
 * Returns paginated booking list for BROKER/ADMIN dashboard.
 * Does NOT expose internal cost/margin data to public.
 */
export async function GET(request: NextRequest) {
    const session = await auth()
    if (!session?.user || !['BROKER', 'ADMIN'].includes(session.user.role)) {
          return Response.json({ error: 'Non autorizzato' }, { status: 401 })
        }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const skip = (page - 1) * limit

    try {
          const where = status ? { status } : {}

          const [bookings, total] = await Promise.all([
                  prisma.booking.findMany({
                            where,
                            orderBy: { createdAt: 'desc' },
                            take: limit,
                            skip,
                            select: {
                                        id: true,
                                        confirmationCode: true,
                                        fromCity: true,
                                        toCity: true,
                                        departureDate: true,
                                        pax: true,
                                        status: true,
                                        totalPrice: true,
                                        depositAmount: true,
                                        depositPaid: true,
                                        depositPaidAt: true,
                                        stripeSessionId: true,
                                        createdAt: true,
                                        updatedAt: true,
                                        // Expose user info (broker can see)
                                        user: {
                                                      select: {
                                                                      id: true,
                                                                      name: true,
                                                                      email: true,
                                                                    },
                                                    },
                                      },
                          }),
                  prisma.booking.count({ where }),
                ])

          return Response.json({
                  bookings,
                  total,
                  page,
                  limit,
                  pages: Math.ceil(total / limit),
                })
        } catch (err) {
          console.error('GET /api/bookings error:', err)
          return Response.json({ error: 'Errore interno' }, { status: 500 })
        }
  }
