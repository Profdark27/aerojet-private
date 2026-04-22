'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import OnboardingTour from '@/components/dashboard/OnboardingTour'

const chartData = [
  { day: '1 Apr', richieste: 2, commissioni: 1800 },
  { day: '5 Apr', richieste: 4, commissioni: 5200 },
  { day: '10 Apr', richieste: 3, commissioni: 3400 },
  { day: '15 Apr', richieste: 6, commissioni: 9100 },
  { day: '18 Apr', richieste: 5, commissioni: 7800 },
  { day: '20 Apr', richieste: 8, commissioni: 14200 },
  { day: 'Oggi', richieste: 3, commissioni: 5500 },
]

const recentRequests = [
  { id: 'RQ-001', client: 'Marco Ferretti', route: 'Milano → Londra', date: '25 Apr', budget: '€12,000', status: 'NEW' },
  { id: 'RQ-002', client: 'Sofia Ricci', route: 'Roma → Dubai', date: '28 Apr', budget: '€55,000', status: 'QUOTED' },
  { id: 'RQ-003', client: 'Azienda SpA', route: 'Torino → Parigi', date: '02 Mag', budget: '€8,000', status: 'IN_PROGRESS' },
  { id: 'RQ-004', client: 'Luca Bianchi', route: 'Milano → NYC', date: '05 Mag', budget: '€95,000', status: 'CONFIRMED' },
  { id: 'RQ-005', client: 'Elena Conti', route: 'Venezia → Ibiza', date: '10 Mag', budget: '€18,000', status: 'NEW' },
]

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  NEW: { label: 'Nuova', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' },
  QUOTED: { label: 'Preventivata', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  IN_PROGRESS: { label: 'In corso', bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  CONFIRMED: { label: 'Confermata', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  CANCELLED: { label: 'Annullata', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
}

const kpis = [
  { label: 'Richieste questo mese', value: '31', delta: '+12%', icon: '✉', color: '#C9A84C' },
  { label: 'Preventivi inviati', value: '18', delta: '+8%', icon: '◆', color: '#60a5fa' },
  { label: 'Tasso conversione', value: '38%', delta: '+4%', icon: '▲', color: '#4ade80' },
  { label: 'Commissioni maturate', value: '€47,200', delta: '+23%', icon: '€', color: '#C9A84C' },
]

export default function DashboardPage() {
  const [activeChart, setActiveChart] = useState<'richieste' | 'commissioni'>('commissioni')
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    const toured = localStorage.getItem('aerojet-toured')
    if (!toured) setShowTour(true)
  }, [])

  const completeTour = () => {
    localStorage.setItem('aerojet-toured', '1')
    setShowTour(false)
  }

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh' }}>
      {showTour && <OnboardingTour onComplete={completeTour} />}

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>APRILE 2026</div>
        <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: 1 }}>Buongiorno, Corrado</h1>
        <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 6 }}>
          Hai 3 nuove richieste in attesa di preventivo.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 40 }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{ background: '#0A0C14', padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 22, color: kpi.color }}>{kpi.icon}</div>
              <div style={{ fontSize: 12, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif', background: 'rgba(34,197,94,0.1)', padding: '3px 8px' }}>
                {kpi.delta}
              </div>
            </div>
            <div style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 300, color: kpi.color, marginBottom: 8 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '32px', marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>ANDAMENTO APRILE</div>
            <div style={{ fontSize: 20, fontWeight: 400 }}>Ultime 3 settimane</div>
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
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)" />
            <XAxis dataKey="day" stroke="rgba(240,237,230,0.2)" tick={{ fontSize: 11, fill: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }} />
            <YAxis stroke="rgba(240,237,230,0.2)" tick={{ fontSize: 11, fill: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }} />
            <Tooltip contentStyle={{ background: '#0A0C14', border: '1px solid rgba(201,168,76,0.3)', color: '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }} />
            <Line type="monotone" dataKey={activeChart} stroke="#C9A84C" strokeWidth={2} dot={{ fill: '#C9A84C', r: 4 }} activeDot={{ r: 6, fill: '#E8C97A' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent requests */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>ULTIME RICHIESTE</div>
          <a href="/dashboard/requests" style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', textDecoration: 'none' }}>VEDI TUTTE →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
              {['ID', 'Cliente', 'Rotta', 'Data', 'Budget', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((req, i) => {
              const s = statusConfig[req.status]
              return (
                <tr key={i} style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>{req.id}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14 }}>{req.client}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: 'rgba(240,237,230,0.7)', fontFamily: 'Helvetica Neue, sans-serif' }}>{req.route}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>{req.date}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#C9A84C' }}>{req.budget}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '4px 10px', letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif' }}>{s.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
