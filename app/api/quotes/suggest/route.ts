import { NextRequest, NextResponse } from 'next/server'
import { calculateSuggestedPrice } from '@/lib/pricingEngine'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const result = calculateSuggestedPrice(data)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Pricing Engine API Error:', error)
    return NextResponse.json({ error: 'Errore interno nel calcolo prezzo' }, { status: 500 })
  }
}
