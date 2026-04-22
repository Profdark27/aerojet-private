import { NextRequest } from 'next/server'

// Mock data — in production this comes from Prisma
const bookings = [
  { id: 'BK-001', date: '2026-03-12', client: 'Marco Rossi', from: 'Milano', to: 'Londra', aircraft: 'Phenom 300E', operator: 'VistaJet', charterPrice: 9800, commissionRate: 0.12, commissionAmount: 1176, status: 'COMPLETED', depositPaid: 2940, balancePaid: 6860 },
  { id: 'BK-002', date: '2026-03-28', client: 'Sofia Ricci', from: 'Roma', to: 'Dubai', aircraft: 'Falcon 7X', operator: 'NetJets', charterPrice: 48500, commissionRate: 0.12, commissionAmount: 5820, status: 'COMPLETED', depositPaid: 14550, balancePaid: 33950 },
  { id: 'BK-003', date: '2026-04-05', client: 'Luca Bianchi', from: 'Milano', to: 'New York', aircraft: 'Global 7500', operator: 'Air Charter Service', charterPrice: 96000, commissionRate: 0.12, commissionAmount: 11520, status: 'CONFIRMED', depositPaid: 28800, balancePaid: 0 },
  { id: 'BK-004', date: '2026-04-10', client: 'Elena Conti', from: 'Venezia', to: 'Ibiza', aircraft: 'Citation XLS+', operator: 'Luxaviation', charterPrice: 18200, commissionRate: 0.12, commissionAmount: 2184, status: 'CONFIRMED', depositPaid: 5460, balancePaid: 0 },
]

function escapeCSV(val: string | number): string {
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'
  const year = searchParams.get('year') || '2026'
  const month = searchParams.get('month')

  const filtered = bookings.filter(b => {
    if (b.date.slice(0, 4) !== year) return false
    if (month && b.date.slice(5, 7) !== month.padStart(2, '0')) return false
    return true
  })

  if (format === 'json') {
    const summary = {
      totalCharter: filtered.reduce((s, b) => s + b.charterPrice, 0),
      totalCommissions: filtered.reduce((s, b) => s + b.commissionAmount, 0),
      totalBookings: filtered.length,
      completedBookings: filtered.filter(b => b.status === 'COMPLETED').length,
      bookings: filtered,
    }
    return Response.json(summary)
  }

  // CSV format
  const headers = [
    'ID', 'Data', 'Cliente', 'Partenza', 'Destinazione', 'Velivolo', 'Operatore',
    'Prezzo Charter (EUR)', 'Commissione %', 'Commissione (EUR)', 'Deposito Ricevuto', 'Saldo Ricevuto', 'Status'
  ]

  const rows = filtered.map(b => [
    b.id, b.date, b.client, b.from, b.to, b.aircraft, b.operator,
    b.charterPrice, `${(b.commissionRate * 100).toFixed(0)}%`,
    b.commissionAmount, b.depositPaid, b.balancePaid, b.status
  ].map(escapeCSV).join(','))

  // Add totals row
  const totalCharter = filtered.reduce((s, b) => s + b.charterPrice, 0)
  const totalComm = filtered.reduce((s, b) => s + b.commissionAmount, 0)
  const totalDeposit = filtered.reduce((s, b) => s + b.depositPaid, 0)
  const totalBalance = filtered.reduce((s, b) => s + b.balancePaid, 0)

  rows.push('')
  rows.push(['TOTALI', '', '', '', '', '', '', totalCharter, '', totalComm, totalDeposit, totalBalance, ''].map(escapeCSV).join(','))

  const csv = [headers.join(','), ...rows].join('\n')

  const filename = `aerojet-commissioni-${year}${month ? '-' + month.padStart(2, '0') : ''}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
