// TODO: [PERFORMANCE] File exceeds 300 lines. Consider refactoring/splitting for better maintainability.
'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import OnboardingTour from '@/components/dashboard/OnboardingTour'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { track } from '@/lib/tracking'

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  NEW: { label: 'Nuova', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' },
  CONTACTED: { label: 'Contattato', bg: 'rgba(34,197,94,0.12)', color: '#4ade80' },
  QUOTING: { label: 'In quotazione', bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  QUOTED: { label: 'Preventivata', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  WON: { label: 'Vinta ✓', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  LOST: { label: 'Persa', bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  IN_PROGRESS: { label: 'In corso', bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  CONFIRMED: { label: 'Confermata', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
}

interface Inquiry {
  id: string
  name: string
  fromCity?: string
  toCity?: string
  flightDate?: string
  budget?: string
  pipelineStatus: string
  leadTier: string
  leadScore: number
  budgetNumeric: number
  urgency: boolean
  urgencyFlag: boolean
  sameDay: boolean
  nextAction: string
  marginEstimate: number
  optimizedQuote: number
  optimizedMargin: number
  suggestedQuote: number
  suggestedAction: string
  revenuePotential: number
  createdAt: string
}

interface InquiriesResponse {
  inquiries: Inquiry[]
  total: number
  byTier: Record<string, number>
  pipeline: { totalValue: number; totalMargin: number }
}

interface StatsResponse {
  usesEstimates: boolean
  kpis: {
    revenueYTD: number
    commissionYTD: number
    bookingsTotal: number
    avgDeal: number
    conversionRate: number
    activeClients: number
    byTier: Record<string, number>
    inquiriesTotal: number
    inquiriesWon: number
  }
  dailyInquiries: Array<{ day: string; richieste: number; commissioni: number }>
  leadFunnel: Array<{ status: string; count: number }>
}

function LeadBadges({ lead }: { lead: Inquiry }) {
  const badges = []
  if (lead.leadTier === 'VIP' || lead.leadScore >= 75)
    badges.push({ label: '🔥 HOT', color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' })
  if (lead.marginEstimate >= 5000)
    badges.push({ label: '💰 MARGINE ALTO', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' })
  if (lead.urgency || lead.sameDay)
    badges.push({ label: '⚡ URGENTE', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' })
  if (lead.leadTier === 'HIGH' && badges.length === 0)
    badges.push({ label: '💎 HIGH VALUE', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' })
  if (badges.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {badges.map(b => (
        <span key={b.label} style={{
          fontSize: 9, padding: '2px 7px', letterSpacing: 0.5,
          color: b.color, background: b.bg,
          fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap',
        }}>{b.label}</span>
      ))}
    </div>
  )
}

type FilterKey = 'all' | 'vip' | 'high_margin' | 'urgent'

const NEXT_ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  CALL_NOW: { label: '📞 CHIAMA', color: '#f87171' },
  WHATSAPP_NOW: { label: '💬 WA ORA', color: '#25D366' },
  EMAIL_ONLY: { label: '✉ EMAIL', color: '#60a5fa' },
  LOW_PRIORITY: { label: '○ BASSA', color: 'rgba(240,237,230,0.25)' },
}

export default function DashboardPage() {
  const [activeChart, setActiveChart] = useState<'richieste' | 'commissioni'>('commissioni')
  const [showTour, setShowTour] = useState(false)
  const [inquiriesData, setInquiriesData] = useState<InquiriesResponse | null>(null)
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loadingTable, setLoadingTable] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  useEffect(() => {
    const toured = localStorage.getItem('aerojet-toured')
    if (!toured) setShowTour(true)
  }, [])

  useEffect(() => {
    // Table: CRUD endpoint
    fetch('/api/inquiries?limit=20&orderBy=score')
      .then(r => r.json())
      .then(setInquiriesData)
      .catch(console.error)
      .finally(() => setLoadingTable(false))

    // KPI + chart: aggregated endpoint
    fetch('/api/dashboard/stats?period=quarter')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false))
  }, [])

  const completeTour = () => {
    localStorage.setItem('aerojet-toured', '1')
    setShowTour(false)
  }

  const loading = loadingTable || loadingStats
  const allInquiries = inquiriesData?.inquiries ?? []

  const chartData = stats?.dailyInquiries ?? []

  const inquiries = allInquiries.filter(i => {
    if (activeFilter === 'vip') return i.leadTier === 'VIP'
    if (activeFilter === 'high_margin') return i.optimizedMargin >= 5000 || i.marginEstimate >= 5000
    if (activeFilter === 'urgent') return i.urgencyFlag || i.sameDay || i.urgency
    return true
  })

  const byTier = stats?.kpis.byTier ?? {}
  const total = stats?.kpis.inquiriesTotal ?? 0
  const revenueYTD = stats?.kpis.revenueYTD ?? 0
  const commissionYTD = stats?.kpis.commissionYTD ?? 0

  const kpis = [
    {
      label: 'Richieste totali',
      value: String(total || '—'),
      delta: byTier.VIP ? `${byTier.VIP} VIP` : '',
      icon: '✉',
      color: '#C9A84C',
    },
    {
      label: 'Lead VIP + HIGH',
      value: String((byTier.VIP || 0) + (byTier.HIGH || 0)),
      delta: byTier.VIP ? `${byTier.VIP} VIP` : '—',
      icon: '🔥',
      color: '#C9A84C',
    },
    {
      label: stats?.usesEstimates ? 'Margine pipeline est.' : 'Commissioni YTD',
      value: commissionYTD > 0
        ? `€${Math.round(commissionYTD).toLocaleString('it-IT')}`
        : '€0',
      delta: stats?.usesEstimates ? 'stima' : '',
      icon: '€',
      color: '#4ade80',
    },
    {
      label: stats?.usesEstimates ? 'Valore pipeline est.' : 'Revenue YTD',
      value: revenueYTD > 0
        ? `€${Math.round(revenueYTD).toLocaleString('it-IT')}`
        : '€0',
      delta: stats?.usesEstimates ? 'stima' : '',
      icon: '◆',
      color: '#60a5fa',
    },
  ]

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh' }}>
      {showTour && <OnboardingTour onComplete={completeTour} />}

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>
          {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }).toUpperCase()}
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: 1 }}>Dashboard Broker</h1>
        <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 6 }}>
          {inquiries.filter(i => i.pipelineStatus === 'NEW').length} nuove richieste in attesa
          {inquiries.filter(i => i.urgency || i.sameDay).length > 0 &&
            ` · ${inquiries.filter(i => i.urgency || i.sameDay).length} urgenti`}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 40 }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{ background: '#0A0C14', padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 22, color: kpi.color }}>{kpi.icon}</div>
              {kpi.delta && (
                <div style={{ fontSize: 11, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', background: 'rgba(201,168,76,0.1)', padding: '3px 8px' }}>
                  {kpi.delta}
                </div>
              )}
            </div>
            <div style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 300, color: kpi.color, marginBottom: 8 }}>
              {loadingStats ? '—' : kpi.value}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '32px', marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>ANDAMENTO · ULTIMI 30 GIORNI</div>
            <div style={{ fontSize: 20, fontWeight: 400 }}>Pipeline commerciale</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['commissioni', 'Commissioni'], ['richieste', 'Richieste']].map(([val, label]) => (
              <button key={val} onClick={() => setActiveChart(val as typeof activeChart)}
                style={{ padding: '8px 16px', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: activeChart === val ? '#C9A84C' : 'transparent', color: activeChart === val ? '#0A0C14' : 'rgba(240,237,230,0.4)', border: '1px solid rgba(201,168,76,0.3)', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loadingStats ? (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>
            Caricamento dati...
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>
            Nessuna richiesta negli ultimi 30 giorni
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)" />
              <XAxis dataKey="day" stroke="rgba(240,237,230,0.2)" tick={{ fontSize: 11, fill: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }} interval={4} />
              <YAxis stroke="rgba(240,237,230,0.2)" tick={{ fontSize: 11, fill: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }} />
              <Tooltip contentStyle={{ background: '#0A0C14', border: '1px solid rgba(201,168,76,0.3)', color: '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }} />
              <Line type="monotone" dataKey={activeChart} stroke="#C9A84C" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#E8C97A' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Lead pipeline */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>PIPELINE LEAD</div>
            <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 3 }}>
              {inquiries.length} lead · ordinati per score
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {([
              ['all', 'Tutti', allInquiries.length],
              ['vip', '🔥 VIP', allInquiries.filter(i => i.leadTier === 'VIP').length],
              ['urgent', '⚡ Urgenti', allInquiries.filter(i => i.urgencyFlag || i.sameDay).length],
              ['high_margin', '💰 Alto margine', allInquiries.filter(i => (i.optimizedMargin || i.marginEstimate) >= 5000).length],
            ] as [FilterKey, string, number][]).map(([key, label, count]) => (
              <button key={key} onClick={() => setActiveFilter(key)}
                style={{ padding: '6px 14px', fontSize: 11, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: activeFilter === key ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeFilter === key ? '#C9A84C' : 'rgba(240,237,230,0.4)', border: activeFilter === key ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(240,237,230,0.08)', transition: 'all 0.15s' }}>
                {label} {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
              </button>
            ))}
            <a href="/dashboard/requests" style={{ fontSize: 11, letterSpacing: 1, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', textDecoration: 'none', marginLeft: 4 }}>TUTTI →</a>
          </div>
        </div>

        {loadingTable ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 14 }}>
            Caricamento...
          </div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.3 }}>✉</div>
            <div style={{ fontSize: 14, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>
              {activeFilter === 'all' ? 'Nessuna richiesta ancora.' : 'Nessun lead per questo filtro.'}
            </div>
            {activeFilter !== 'all' && (
              <button onClick={() => setActiveFilter('all')} style={{ marginTop: 8, fontSize: 11, color: '#C9A84C', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', padding: '6px 16px', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
                MOSTRA TUTTI
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                  {['Cliente', 'Rotta', 'Budget / Quota ott.', 'Azione', 'Score', 'Margine', 'Status', 'Azioni'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inquiries.map((lead) => {
                  const s = statusConfig[lead.pipelineStatus] || statusConfig['NEW']
                  const route = lead.fromCity && lead.toCity ? `${lead.fromCity} → ${lead.toCity}` : 'N/D'
                  return (
                    <tr key={lead.id}
                      style={{ borderBottom: '1px solid rgba(201,168,76,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                      <td style={{ padding: '14px 16px', minWidth: 160 }}>
                        <div style={{ fontSize: 14, marginBottom: 5 }}>{lead.name}</div>
                        <LeadBadges lead={lead} />
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>
                        {route}
                        {lead.flightDate && <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)', marginTop: 3 }}>{lead.flightDate}</div>}
                      </td>

                      <td style={{ padding: '14px 16px', minWidth: 140 }}>
                        <div style={{ fontSize: 13, color: '#C9A84C' }}>{lead.budget || '—'}</div>
                        {(lead.optimizedQuote > 0 || lead.suggestedQuote > 0) && (
                          <div style={{ fontSize: 11, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 3 }}>
                            quota ott. €{(lead.optimizedQuote || lead.suggestedQuote).toLocaleString('it-IT')}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        {(() => {
                          const cfg = NEXT_ACTION_CONFIG[lead.nextAction]
                          if (!cfg) return <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif' }}>—</span>
                          return (
                            <span style={{ fontSize: 10, padding: '3px 8px', letterSpacing: 0.5, color: cfg.color, background: `${cfg.color}18`, fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>
                              {cfg.label}
                            </span>
                          )
                        })()}
                      </td>

                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${lead.leadScore >= 70 ? '#C9A84C' : lead.leadScore >= 40 ? '#60a5fa' : 'rgba(240,237,230,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: lead.leadScore >= 70 ? '#C9A84C' : '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif', flexShrink: 0 }}>
                            {lead.leadScore}
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>{lead.leadTier}</div>
                            {lead.urgencyFlag && <div style={{ fontSize: 10, color: '#fb923c', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 2 }}>⚡ urgente</div>}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: 13, color: lead.marginEstimate > 0 ? '#4ade80' : 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>
                        {lead.marginEstimate > 0 ? `€${lead.marginEstimate.toLocaleString('it-IT')}` : '—'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: 10, padding: '4px 10px', letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>
                          {s.label}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <a
                            href={buildWhatsAppUrl('volo', { from: lead.fromCity, to: lead.toCity, budget: lead.budget || '', priority: lead.leadTier })}
                            target="_blank" rel="noopener noreferrer"
                            onClick={() => track('click_whatsapp', { source: 'dashboard', leadId: lead.id })}
                            title="Contatta via WhatsApp"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, background: 'rgba(37,211,102,0.15)', color: '#25D366', textDecoration: 'none', fontSize: 14, flexShrink: 0 }}>
                            💬
                          </a>
                          {lead.suggestedAction && (
                            <div
                              title={lead.suggestedAction}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: 12, cursor: 'help', flexShrink: 0 }}>
                              ℹ
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && revenueYTD > 0 && (
          <div style={{ padding: '16px 32px', borderTop: '1px solid rgba(201,168,76,0.06)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', color: 'rgba(240,237,230,0.35)' }}>
              {stats?.usesEstimates ? 'Pipeline stimato' : 'Revenue confermata'}:{' '}
              <span style={{ color: '#60a5fa' }}>€{revenueYTD.toLocaleString('it-IT')}</span>
            </div>
            <div style={{ fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', color: 'rgba(240,237,230,0.35)' }}>
              {stats?.usesEstimates ? 'Margine stimato' : 'Commissioni'}:{' '}
              <span style={{ color: '#4ade80' }}>€{commissionYTD.toLocaleString('it-IT')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
