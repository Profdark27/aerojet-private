import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const MONTH_IT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']

const JET_COLORS: Record<string, string> = {
  turboprop: '#4ade80',
  light: '#C9A84C',
  midsize: '#E8C97A',
  supermid: '#D4B060',
  heavy: '#9E7B30',
  ultralong: '#60a5fa',
}

const JET_LABELS: Record<string, string> = {
  turboprop: 'Turboprop',
  light: 'Light Jet',
  midsize: 'Midsize',
  supermid: 'Super Mid',
  heavy: 'Heavy Jet',
  ultralong: 'Ultra-Long',
}

function getPeriodStart(period: string): Date {
  const now = new Date()
  const d = new Date(now)
  if (period === 'month') {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
  } else if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    d.setMonth(q * 3, 1)
    d.setHours(0, 0, 0, 0)
  } else {
    // year
    d.setMonth(0, 1)
    d.setHours(0, 0, 0, 0)
  }
  return d
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['BROKER', 'ADMIN'].includes(session.user.role)) {
    return Response.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? 'quarter'
  const startDate = getPeriodStart(period)
  const now = new Date()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const [
    bookings,
    periodInquiries,
    allInquiriesCount,
    wonCount,
    activeClients,
    byTier,
    byStatus,
    recentInquiries,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        totalPrice: true,
        commission: true,
        jetCategory: true,
        fromCity: true,
        toCity: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.inquiry.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        createdAt: true,
        clientQuoteEstimate: true,
        marginEstimate: true,
        pipelineStatus: true,
        fromCity: true,
        toCity: true,
      },
    }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { pipelineStatus: 'WON' } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.inquiry.groupBy({ by: ['leadTier'], _count: { id: true } }),
    prisma.inquiry.groupBy({ by: ['pipelineStatus'], _count: { id: true } }),
    prisma.inquiry.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, marginEstimate: true },
    }),
  ])

  // ---------- KPIs ----------
  const confirmedBookings = bookings.filter(b =>
    b.status === 'CONFIRMED' || b.status === 'COMPLETED'
  )
  const revenueYTD = confirmedBookings.reduce((s, b) => s + (b.totalPrice ?? 0), 0)
  const commissionYTD = confirmedBookings.reduce((s, b) => s + (b.commission ?? 0), 0)

  // Fallback a stime inquiry quando non ci sono booking confermati
  const usesEstimates = confirmedBookings.length === 0
  const estimateCharter = periodInquiries.reduce((s, i) => s + (i.clientQuoteEstimate ?? 0), 0)
  const estimateMargin = periodInquiries.reduce((s, i) => s + (i.marginEstimate ?? 0), 0)

  const effectiveRevenue = usesEstimates ? estimateCharter : revenueYTD
  const effectiveCommission = usesEstimates ? estimateMargin : commissionYTD
  const effectiveCount = usesEstimates ? periodInquiries.length : confirmedBookings.length
  const avgDeal = effectiveCount > 0 ? Math.round(effectiveRevenue / effectiveCount) : 0
  const conversionRate = allInquiriesCount > 0
    ? Math.round((wonCount / allInquiriesCount) * 100)
    : 0

  // ---------- Revenue by month ----------
  const firstMonth = startDate.getMonth()
  const lastMonth = now.getMonth()
  const monthBuckets: Record<number, { charter: number; commissioni: number; voli: number }> = {}
  for (let m = firstMonth; m <= lastMonth; m++) {
    monthBuckets[m] = { charter: 0, commissioni: 0, voli: 0 }
  }

  const revenueSource = usesEstimates
    ? periodInquiries.map(i => ({
        date: i.createdAt,
        charter: i.clientQuoteEstimate ?? 0,
        commissioni: i.marginEstimate ?? 0,
      }))
    : confirmedBookings.map(b => ({
        date: b.createdAt,
        charter: b.totalPrice ?? 0,
        commissioni: b.commission ?? 0,
      }))

  for (const r of revenueSource) {
    const m = new Date(r.date).getMonth()
    if (m in monthBuckets) {
      monthBuckets[m].charter += r.charter
      monthBuckets[m].commissioni += r.commissioni
      monthBuckets[m].voli += 1
    }
  }

  const revenueByMonth = Object.entries(monthBuckets).map(([m, v]) => ({
    month: MONTH_IT[parseInt(m)],
    charter: Math.round(v.charter),
    commissioni: Math.round(v.commissioni),
    voli: v.voli,
  }))

  // ---------- Jet mix ----------
  const jetMap: Record<string, number> = {}
  for (const b of bookings) {
    const cat = (b.jetCategory ?? 'altro').toLowerCase().trim()
    jetMap[cat] = (jetMap[cat] ?? 0) + 1
  }
  const totalJets = Object.values(jetMap).reduce((s, v) => s + v, 0) || 1
  const jetMix = Object.entries(jetMap)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      name: JET_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1),
      value: Math.round((count / totalJets) * 100),
      color: JET_COLORS[key] ?? '#888888',
    }))

  // ---------- Top routes ----------
  const routeMap: Record<string, { voli: number; revenue: number }> = {}
  const routeSource = usesEstimates
    ? periodInquiries
        .filter(i => i.fromCity && i.toCity)
        .map(i => ({ from: i.fromCity!, to: i.toCity!, revenue: i.clientQuoteEstimate ?? 0 }))
    : bookings
        .filter(b => b.fromCity && b.toCity)
        .map(b => ({ from: b.fromCity, to: b.toCity, revenue: b.totalPrice ?? 0 }))

  for (const r of routeSource) {
    const key = `${r.from} → ${r.to}`
    if (!routeMap[key]) routeMap[key] = { voli: 0, revenue: 0 }
    routeMap[key].voli += 1
    routeMap[key].revenue += r.revenue
  }
  const topRoutes = Object.entries(routeMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([route, v]) => ({ route, voli: v.voli, revenue: Math.round(v.revenue) }))

  // ---------- Lead funnel ----------
  const statusOrder = ['NEW', 'CONTACTED', 'QUOTING', 'QUOTED', 'WON', 'LOST']
  const statusMap = Object.fromEntries(byStatus.map(r => [r.pipelineStatus, r._count.id]))
  const leadFunnel = statusOrder.map(s => ({ status: s, count: statusMap[s] ?? 0 }))

  // ---------- Daily inquiries (30 days) ----------
  const dailyBuckets: Record<string, { richieste: number; commissioni: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    dailyBuckets[key] = { richieste: 0, commissioni: 0 }
  }
  for (const inq of recentInquiries) {
    const key = new Date(inq.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    if (key in dailyBuckets) {
      dailyBuckets[key].richieste += 1
      dailyBuckets[key].commissioni += Math.round(inq.marginEstimate ?? 0)
    }
  }
  const dailyInquiries = Object.entries(dailyBuckets).map(([day, v]) => ({ day, ...v }))

  return Response.json({
    period,
    usesEstimates,
    kpis: {
      revenueYTD: Math.round(effectiveRevenue),
      commissionYTD: Math.round(effectiveCommission),
      bookingsTotal: effectiveCount,
      avgDeal,
      conversionRate,
      activeClients,
      byTier: Object.fromEntries(byTier.map(r => [r.leadTier, r._count.id])),
      inquiriesTotal: allInquiriesCount,
      inquiriesWon: wonCount,
    },
    revenueByMonth,
    jetMix,
    topRoutes,
    leadFunnel,
    dailyInquiries,
  })
}
