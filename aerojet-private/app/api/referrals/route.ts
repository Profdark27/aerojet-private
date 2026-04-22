import { NextRequest } from 'next/server'

// In-memory store (use Prisma in production)
const referrals: Array<{
  code: string; ownerId: string; ownerEmail: string; ownerName: string
  uses: number; earnings: number; createdAt: string
}> = [
  { code: 'MARCO2026', ownerId: 'U001', ownerEmail: 'marco@example.it', ownerName: 'Marco Ferretti', uses: 3, earnings: 1200, createdAt: '2026-01-15' },
]

function generateCode(name: string): string {
  const base = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)
  const year = new Date().getFullYear()
  return `${base}${year}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (email) {
    const ref = referrals.find(r => r.ownerEmail === email)
    if (ref) return Response.json({ referral: ref })
    return Response.json({ referral: null })
  }

  return Response.json({ referrals, total: referrals.length })
}

export async function POST(request: NextRequest) {
  const { ownerEmail, ownerName, ownerId } = await request.json()

  if (!ownerEmail || !ownerName) {
    return Response.json({ error: 'Email e nome richiesti' }, { status: 400 })
  }

  // Check if already has a code
  const existing = referrals.find(r => r.ownerEmail === ownerEmail)
  if (existing) return Response.json({ referral: existing })

  const code = generateCode(ownerName)
  const referral = { code, ownerId: ownerId || 'guest', ownerEmail, ownerName, uses: 0, earnings: 0, createdAt: new Date().toISOString().split('T')[0] }
  referrals.push(referral)

  return Response.json({ referral }, { status: 201 })
}
