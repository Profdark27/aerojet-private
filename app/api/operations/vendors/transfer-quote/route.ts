import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { transfer } from '@/lib/vendors/transfer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.role !== 'BROKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const details = await req.json()
    const result = await transfer.requestTransferQuote(details)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[API/TransferQuote] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to request transfer quote' }, { status: 500 })
  }
}
