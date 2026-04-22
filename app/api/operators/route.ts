import { getOperators } from '@/lib/avinode'

export async function GET() {
  try {
    const operators = await getOperators()
    return Response.json({ operators })
  } catch {
    return Response.json({ error: 'Failed to fetch operators' }, { status: 500 })
  }
}
