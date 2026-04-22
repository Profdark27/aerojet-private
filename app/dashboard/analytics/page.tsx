'use client'
import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

const revenueData = [
  { month: 'Gen', charter: 48000, commissioni: 5760, voli: 4 },
  { month: 'Feb', charter: 72000, commissioni: 8640, voli: 6 },
  { month: 'Mar', charter: 58500, commissioni: 7020, voli: 5 },
  { month: 'Apr', charter: 174500, commissioni: 20940, voli: 16 },
]

const jetMix = [
  { name: 'Light Jet', value: 35, color: '#C9A84C' },
  { name: 'Midsize', value: 25, color: '#E8C97A' },
  { name: 'Heavy', value: 20, color: '#9E7B30' },
  { name: 'Ultra-Long', value: 12, color: '#60a5fa' },
  { name: 'Turboprop', value: 8, color: '#4ade80' },
]

const topRoutes = [
  { route: 'Milano → Londra', voli: 8, revenue: 78400 },
  { route: 'Roma → Dubai', voli: 4, revenue: 194000 },
  { route: 'Milano → NYC', voli: 2, revenue: 192000 },
  { route: 'Venezia → Ibiza', voli: 6, revenue: 109200 },
  { route: 'Ginevra → Nizza', voli: 10, revenue: 42000 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.25)', padding: '12px 16px' }}>
      <div style={{ fontSize: 12, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ fontSize: 13, color: '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif' }}>
          {p.name}: <strong style={{ color: '#C9A84C' }}>{typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

const kpis = [
  { label: 'Revenue YTD', value: '€353,000', delta: '+34%', sub: 'vs stesso periodo 2025', color: '#C9A84C' },
  { label: 'Commissioni YTD', value: '€42,360', delta: '+34%', sub: '12% avg rate', color: '#4ade80' },
  { label: 'Voli Totali', value: '31', delta: '+41%', sub: 'di cui 24 completati', color: '#60a5fa' },
  { label: 'Deal Medio', value: '€11,387', delta: '+8%', sub: 'per volo completato', color: '#C9A84C' },
  { label: 'Tasso Conversione', value: '38%', delta: '+4pp', sub: 'richieste → prenotazioni', color: '#4ade80' },
  { label: 'Clienti Attivi', value: '48', delta: '+12', sub: 'utenti registrati', color: '#60a5fa' },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('quarter')
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/export?format=csv&year=2026')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'aerojet-commissioni-2026.csv'; a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

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

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 40 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#0A0C14', padding: '24px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>{k.label.toUpperCase()}</div>
              <div style={{ fontSize: 11, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif', background: 'rgba(74,222,128,0.1)', padding: '2px 8px' }}>{k.delta}</div>
            </div>
            <div style={{ fontSize: 'clamp(22px,3vw,30px)', color: k.color, fontWeight: 300, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 32 }}>

        {/* Area chart - Revenue */}
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '28px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>ANDAMENTO REVENUE</div>
              <div style={{ fontSize: 18 }}>Charter vs Commissioni</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif' }}>
              <span style={{ color: 'rgba(201,168,76,0.6)' }}>■ Charter</span>
              <span style={{ color: '#4ade80' }}>■ Commissioni</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
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
              <YAxis stroke="rgba(240,237,230,0.2)" tick={{ fill: 'rgba(240,237,230,0.4)', fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif' }} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="charter" name="Charter" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" />
              <Area type="monotone" dataKey="commissioni" name="Commissioni" stroke="#4ade80" strokeWidth={2} fill="url(#greenGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie - Jet mix */}
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '28px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>MIX CATEGORIA JET</div>
          <div style={{ fontSize: 18, marginBottom: 20 }}>Per volume voli</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={jetMix} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {jetMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
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
      </div>

      {/* Bar chart - Monthly flights */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '28px 24px', marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>VOLI PER MESE</div>
        <div style={{ fontSize: 18, marginBottom: 20 }}>Volume prenotazioni</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" />
            <XAxis dataKey="month" stroke="rgba(240,237,230,0.2)" tick={{ fill: 'rgba(240,237,230,0.4)', fontSize: 11 }} />
            <YAxis stroke="rgba(240,237,230,0.2)" tick={{ fill: 'rgba(240,237,230,0.4)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="voli" name="Voli" fill="#C9A84C" opacity={0.85} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top routes table */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>ROTTE TOP REVENUE</div>
          <Link href="/dashboard/requests" style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif' }}>TUTTE →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#050810', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
              {['Rotta', 'Voli', 'Revenue Totale', 'Revenue Media', 'Commissioni'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topRoutes.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '16px 20px', fontSize: 15 }}>{r.route}</td>
                <td style={{ padding: '16px 20px', fontSize: 14, color: '#60a5fa', fontFamily: 'Helvetica Neue, sans-serif' }}>{r.voli}</td>
                <td style={{ padding: '16px 20px', fontSize: 15, color: '#C9A84C' }}>{formatCurrency(r.revenue)}</td>
                <td style={{ padding: '16px 20px', fontSize: 14, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif' }}>{formatCurrency(Math.round(r.revenue / r.voli))}</td>
                <td style={{ padding: '16px 20px', fontSize: 14, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif' }}>{formatCurrency(Math.round(r.revenue * 0.12))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
