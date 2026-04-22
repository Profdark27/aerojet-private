import { searchFlights, type FlightSearchParams } from '@/lib/avinode'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const params: FlightSearchParams = {
    fromICAO: searchParams.get('fromICAO') || 'LIML',
    toICAO: searchParams.get('toICAO') || 'EGLL',
    fromCity: searchParams.get('from') || 'Milano',
    toCity: searchParams.get('to') || 'Londra',
    departureDate: searchParams.get('date') || new Date().toISOString().split('T')[0],
    pax: parseInt(searchParams.get('pax') || '2'),
    jetCategory: searchParams.get('category') || undefined,
  }

  try {
    const aircraft = await searchFlights(params)
    return Response.json({ aircraft, params, source: process.env.AVINODE_API_KEY ? 'live' : 'mock' })
  } catch {
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
