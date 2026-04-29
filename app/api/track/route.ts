import { NextRequest } from 'next/server'
import crypto from 'crypto'

// Store in-memory per dev — in prod: Prisma o analytics SaaS
// Max 10k eventi, poi rotazione FIFO
const MAX_EVENTS = 10_000
const events: Array<{
  event: string
  path: string
  sessionId: string
  ts: number
  metadata?: Record<string, unknown>
  userAgent?: string
  ipHash?: string
}> = []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, path, sessionId, ts, metadata } = body

    if (typeof event !== 'string' || !event) {
      return Response.json({ ok: false }, { status: 400 })
    }

    if (events.length >= MAX_EVENTS) events.shift()

    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
    const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16)
    const userAgent = req.headers.get('user-agent') || 'Unknown'

    events.push({
      event: String(event).slice(0, 64),
      path: String(path || '/').slice(0, 256),
      sessionId: String(sessionId || 'anon').slice(0, 64),
      ts: typeof ts === 'number' ? ts : Date.now(),
      metadata,
      userAgent: String(userAgent).slice(0, 256),
      ipHash,
    })

    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}

// GET per dashboard (solo broker/admin in prod: aggiungere auth)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const eventFilter = searchParams.get('event')
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500)

  const filtered = eventFilter
    ? events.filter(e => e.event === eventFilter)
    : events

  // Aggregazione per evento
  const counts: Record<string, number> = {}
  for (const e of events) {
    counts[e.event] = (counts[e.event] || 0) + 1
  }

  return Response.json({
    total: filtered.length,
    counts,
    events: filtered.slice(-limit).reverse(),
  })
}
