import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { catering } from '@/lib/vendors/catering'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.role !== 'BROKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const order = await req.json()
    const result = await catering.requestCateringQuote(order)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[API/CateringQuote] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to request catering quote' }, { status: 500 })
  }
}
