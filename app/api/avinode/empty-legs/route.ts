import { getEmptyLegs } from '@/lib/avinode'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fromICAO = searchParams.get('from') || undefined
  const toICAO = searchParams.get('to') || undefined

  try {
    const legs = await getEmptyLegs({ fromICAO, toICAO })
    return Response.json({ legs, source: process.env.AVINODE_API_KEY ? 'live' : 'mock' })
  } catch {
    return Response.json({ legs: [], error: 'Failed to fetch empty legs' }, { status: 500 })
  }
}
