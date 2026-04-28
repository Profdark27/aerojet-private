// TODO: [PERFORMANCE] File exceeds 300 lines. Consider refactoring/splitting for better maintainability.
'use client'
import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface StatsResponse {
  period: string
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
  revenueByMonth: Array<{ month: string; charter: number; commissioni: number; voli: number }>
  jetMix: Array<{ name: string; value: number; color: string }>
  topRoutes: Array<{ route: string; voli: number; revenue: number }>
  leadFunnel: Array<{ status: string; count: number }>
  dailyInquiries: Array<{ day: string; richieste: number; commissioni: number }>
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.25)', padding: '12px 16px' }}>
      <div style={{ fontSize: 12, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ fontSize: 13, color: '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif' }}>
          {p.name}:{' '}
          <strong style={{ color: '#C9A84C' }}>
            {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}
          </strong>
        </div>
      ))}
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 40 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: '#0A0C14', padding: '24px 20px' }}>
          <div style={{ height: 10, width: 80, background: 'rgba(240,237,230,0.06)', marginBottom: 16 }} />
          <div style={{ height: 28, width: 120, background: 'rgba(240,237,230,0.06)', marginBottom: 12 }} />
          <div style={{ height: 10, width: 100, background: 'rgba(240,237,230,0.04)' }} />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>
      Caricamento dati...
    </div>
  )
}

function EmptyChart({ message, height = 220 }: { message: string; height?: number }) {
  return (
    <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ fontSize: 28, opacity: 0.15 }}>◈</div>
      <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif' }}>{message}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('quarter')
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/dashboard/stats?period=${period}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [period])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/export?format=csv&year=2026')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'aerojet-commissioni-2026.csv'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const kpis = stats ? [
    {
      label: stats.usesEstimates ? 'Valore pipeline est.' : 'Revenue YTD',
      value: formatCurrency(stats.kpis.revenueYTD),
      delta: stats.usesEstimates ? 'STIMA' : 'CONFERMATO',
      deltaColor: stats.usesEstimates ? '#C9A84C' : '#4ade80',
      sub: stats.usesEstimates ? 'da richieste pipeline' : 'booking confermati',
      color: '#C9A84C',
    },
    {
      label: stats.usesEstimates ? 'Margine pipeline est.' : 'Commissioni YTD',
      value: formatCurrency(stats.kpis.commissionYTD),
      delta: stats.usesEstimates ? 'STIMA' : 'NETTO',
      deltaColor: '#4ade80',
      sub: stats.usesEstimates ? 'margine medio stimato' : '12% avg commission',
      color: '#4ade80',
    },
    {
      label: stats.usesEstimates ? 'Richieste periodo' : 'Voli Confermati',
      value: String(stats.kpis.bookingsTotal),
      delta: `${stats.kpis.inquiriesWon} WON`,
      deltaColor: '#60a5fa',
      sub: `${stats.kpis.inquiriesTotal} richieste totali`,
      color: '#60a5fa',
    },
    {
      label: 'Deal Medio',
      value: stats.kpis.avgDeal > 0 ? formatCurrency(stats.kpis.avgDeal) : '—',
      delta: '',
      deltaColor: '#C9A84C',
      sub: 'per richiesta / volo',
      color: '#C9A84C',
    },
    {
      label: 'Tasso Conversione',
      value: `${stats.kpis.conversionRate}%`,
      delta: '',
      deltaColor: '#4ade80',
      sub: 'richieste → WON',
      color: '#4ade80',
    },
    {
      label: 'Clienti Attivi',
      value: String(stats.kpis.activeClients),
      delta: stats.kpis.byTier?.VIP ? `${stats.kpis.byTier.VIP} VIP` : '',
      deltaColor: '#C9A84C',
      sub: 'utenti registrati CLIENT',
      color: '#60a5fa',
    },
  ] : []

  const revenueByMonth = stats?.revenueByMonth ?? []
  const jetMix = stats?.jetMix ?? []
  const topRoutes = stats?.topRoutes ?? []

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>ANALYTICS</div>
          <h1 style={{ fontSize: 32, fontWeight: 300, margin: 0 }}>Performance 2026</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['month', 'quarter', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '8px 18px', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: period === p ? '#C9A84C' : 'transparent', color: period === p ? '#0A0C14' : 'rgba(240,237,230,0.4)', border: '1px solid rgba(201,168,76,0.3)', transition: 'all 0.2s' }}>
              {p === 'month' ? 'MESE' : p === 'quarter' ? 'TRIMESTRE' : 'ANNO'}
            </button>
          ))}
          <button onClick={handleExport} disabled={exporting}
            style={{ padding: '8px 18px', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: 'transparent', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', transition: 'all 0.2s', opacity: exporting ? 0.6 : 1 }}>
            {exporting ? '...' : '↓ CSV'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ marginBottom: 32, padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>
          Errore caricamento dati: {error} — <button onClick={() => { setLoading(true); setError(null); fetch(`/api/dashboard/stats?period=${period}`).then(r => r.json()).then(setStats).catch(e => setError(e.message)).finally(() => setLoading(false)) }} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13, textDecoration: 'underline' }}>Riprova</button>
        </div>
      )}

      {/* Estimates disclaimer */}
      {!loading && stats?.usesEstimates && (
        <div style={{ marginBottom: 24, padding: '10px 16px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(240,237,230,0.5)', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 0.5 }}>
          ◆ Dati basati su stime pipeline inquiry — nessun booking confermato nel periodo selezionato.
        </div>
      )}

      {/* KPI Grid */}
      {loading ? <KpiSkeleton /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 40 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: '#0A0C14', padding: '24px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>{k.label.toUpperCase()}</div>
                {k.delta && (
                  <div style={{ fontSize: 10, color: k.deltaColor, fontFamily: 'Helvetica Neue, sans-serif', background: `${k.deltaColor}18`, padding: '2px 8px', letterSpacing: 0.5 }}>{k.delta}</div>
                )}
              </div>
              <div style={{ fontSize: 'clamp(22px,3vw,30px)', color: k.color, fontWeight: 300, marginBottom: 4 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>{k.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: jetMix.length > 0 ? '1fr 320px' : '1fr', gap: 24, marginBottom: 32 }}>

        {/* Area chart - Revenue */}
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '28px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>ANDAMENTO REVENUE</div>
              <div style={{ fontSize: 18 }}>{stats?.usesEstimates ? 'Pipeline est. vs Margine' : 'Charter vs Commissioni'}</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif' }}>
              <span style={{ color: 'rgba(201,168,76,0.6)' }}>■ {stats?.usesEstimates ? 'Pipeline' : 'Charter'}</span>
              <span style={{ color: '#4ade80' }}>■ {stats?.usesEstimates ? 'Margine' : 'Commissioni'}</span>
            </div>
          </div>
          {loading ? <ChartSkeleton /> : revenueByMonth.length === 0 ? (
            <EmptyChart message="Nessun dato nel periodo selezionato" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" />
                <XAxis dataKey="month" stroke="rgba(240,237,230,0.2)" tick={{ fill: 'rgba(240,237,230,0.4)', fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif' }} />
                <YAxis stroke="rgba(240,237,230,0.2)" tick={{ fill: 'rgba(240,237,230,0.4)', fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif' }} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="charter" name={stats?.usesEstimates ? 'Pipeline' : 'Charter'} stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" />
                <Area type="monotone" dataKey="commissioni" name={stats?.usesEstimates ? 'Margine' : 'Commissioni'} stroke="#4ade80" strokeWidth={2} fill="url(#greenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie - Jet mix (only when bookings exist) */}
        {jetMix.length > 0 && (
          <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '28px 24px' }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>MIX CATEGORIA JET</div>
            <div style={{ fontSize: 18, marginBottom: 20 }}>Per volume voli</div>
            {loading ? <ChartSkeleton height={160} /> : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={jetMix} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {jetMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {jetMix.map(j => (
                <div key={j.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: j.color, flexShrink: 0 }} />
                    <span style={{ color: 'rgba(240,237,230,0.6)' }}>{j.name}</span>
                  </div>
                  <span style={{ color: j.color }}>{j.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bar chart - Monthly volume */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '28px 24px', marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>VOLUME PER MESE</div>
        <div style={{ fontSize: 18, marginBottom: 20 }}>Richieste / Prenotazioni</div>
        {loading ? <ChartSkeleton height={180} /> : revenueByMonth.length === 0 ? (
          <EmptyChart message="Nessun dato" height={180} />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" />
              <XAxis dataKey="month" stroke="rgba(240,237,230,0.2)" tick={{ fill: 'rgba(240,237,230,0.4)', fontSize: 11 }} />
              <YAxis stroke="rgba(240,237,230,0.2)" tick={{ fill: 'rgba(240,237,230,0.4)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="voli" name="Voli / Richieste" fill="#C9A84C" opacity={0.85} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top routes table */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>
            ROTTE TOP REVENUE {stats?.usesEstimates ? '(STIME PIPELINE)' : ''}
          </div>
          <Link href="/dashboard/requests" style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif' }}>TUTTE →</Link>
        </div>

        {loading ? (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: 20, background: 'rgba(240,237,230,0.04)', borderRadius: 2 }} />
            ))}
          </div>
        ) : topRoutes.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>
            Nessuna rotta con dati nel periodo selezionato.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#050810', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                {['Rotta', 'Voli', 'Revenue Totale', 'Revenue Media', 'Commissioni est.'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topRoutes.map((r, i) => (
                <tr key={i}
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '16px 20px', fontSize: 15 }}>{r.route}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#60a5fa', fontFamily: 'Helvetica Neue, sans-serif' }}>{r.voli}</td>
                  <td style={{ padding: '16px 20px', fontSize: 15, color: '#C9A84C' }}>{formatCurrency(r.revenue)}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {r.voli > 0 ? formatCurrency(Math.round(r.revenue / r.voli)) : '—'}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {formatCurrency(Math.round(r.revenue * 0.12))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
