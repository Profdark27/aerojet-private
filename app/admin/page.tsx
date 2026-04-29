'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

const mockUsers = [
  { id: 'U001', name: 'Corrado Aerojet', email: 'corrado@aerojet.app', role: 'BROKER', flights: 12, spent: 284000, joined: '01 Gen 2026', status: 'ACTIVE' },
  { id: 'U002', name: 'Sofia Ricci', email: 's.ricci@luxury.com', role: 'CLIENT', flights: 4, spent: 156000, joined: '15 Feb 2026', status: 'ACTIVE' },
  { id: 'U003', name: 'Marco Ferretti', email: 'm.ferretti@email.it', role: 'CLIENT', flights: 1, spent: 9800, joined: '10 Mar 2026', status: 'ACTIVE' },
  { id: 'U004', name: 'Luca Bianchi', email: 'luca@vc.fund', role: 'CLIENT', flights: 8, spent: 620000, joined: '22 Gen 2026', status: 'ACTIVE' },
  { id: 'U005', name: 'Elena Conti', email: 'elena@lifestyle.it', role: 'CLIENT', flights: 2, spent: 28000, joined: '05 Apr 2026', status: 'PENDING' },
]

const mockBookings = [
  { id: 'BK-001', client: 'Luca Bianchi', route: 'Milano → NYC', date: '05 Mag', aircraft: 'Global 7500', total: 96000, commission: 11520, status: 'CONFIRMED', broker: 'Corrado' },
  { id: 'BK-002', client: 'Sofia Ricci', route: 'Roma → Dubai', date: '28 Apr', aircraft: 'Falcon 7X', total: 48500, commission: 5820, status: 'CONFIRMED', broker: 'Corrado' },
  { id: 'BK-003', client: 'Marco Ferretti', route: 'Milano → Londra', date: '25 Apr', aircraft: 'Phenom 300E', total: 9800, commission: 1176, status: 'PENDING', broker: 'Corrado' },
  { id: 'BK-004', client: 'Elena Conti', route: 'Venezia → Ibiza', date: '10 Mag', aircraft: 'Citation XLS+', total: 18200, commission: 2184, status: 'PENDING', broker: 'Corrado' },
]

const platform = {
  mrr: 47200, bookings: 31, conversion: 38, avgDeal: 45200,
  totalRevenue: 284000, totalCommissions: 34080,
  activeUsers: 48, newThisMonth: 12,
}

const statusColor: Record<string, string> = {
  ACTIVE: '#4ade80', PENDING: '#C9A84C', SUSPENDED: '#f87171',
  CONFIRMED: '#4ade80', CANCELLED: '#f87171',
}

type Tab = 'overview' | 'users' | 'bookings' | 'settings'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [userRole, setUserRole] = useState<Record<string, string>>(Object.fromEntries(mockUsers.map(u => [u.id, u.role])))

  return (
    <div style={{ minHeight: '100vh', background: '#030508', color: '#F0EDE6' }}>

      {/* Admin navbar */}
      <nav style={{ background: '#050810', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '0 40px', display: 'flex', alignItems: 'center', gap: 32, height: 60 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ color: '#C9A84C', fontSize: 16 }}>✦</span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 4, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
        </Link>
        <div style={{ width: 1, height: 20, background: 'rgba(239,68,68,0.3)' }} />
        <span style={{ fontSize: 10, letterSpacing: 3, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif' }}>ADMIN PANEL</span>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.4)', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif' }}>
          BROKER DASHBOARD →
        </Link>
      </nav>

      <div style={{ display: 'flex' }}>

        {/* Sidebar */}
        <aside style={{ width: 200, background: '#050810', minHeight: 'calc(100vh - 60px)', padding: '24px 0', flexShrink: 0, borderRight: '1px solid rgba(239,68,68,0.1)' }}>
          {(['overview', 'users', 'bookings', 'settings'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ display: 'block', width: '100%', padding: '12px 24px', background: 'none', border: 'none', borderLeft: tab === t ? '2px solid #f87171' : '2px solid transparent', color: tab === t ? '#F0EDE6' : 'rgba(240,237,230,0.35)', textAlign: 'left', fontSize: 12, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {t === 'overview' ? 'OVERVIEW' : t === 'users' ? 'UTENTI' : t === 'bookings' ? 'PRENOTAZIONI' : 'IMPOSTAZIONI'}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '40px 48px', overflowX: 'auto' }}>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>ADMIN</div>
              <h1 style={{ fontSize: 28, fontWeight: 300, margin: '0 0 40px' }}>Platform Overview</h1>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: 'rgba(239,68,68,0.15)', marginBottom: 40 }}>
                {[
                  { v: formatCurrency(platform.mrr), l: 'Revenue Mensile', c: '#C9A84C' },
                  { v: platform.bookings.toString(), l: 'Prenotazioni', c: '#60a5fa' },
                  { v: `${platform.conversion}%`, l: 'Conversione', c: '#4ade80' },
                  { v: platform.activeUsers.toString(), l: 'Utenti Attivi', c: '#C9A84C' },
                  { v: formatCurrency(platform.totalCommissions), l: 'Commissioni Totali', c: '#4ade80' },
                  { v: formatCurrency(platform.avgDeal), l: 'Deal Medio', c: '#C9A84C' },
                ].map(({ v, l, c }) => (
                  <div key={l} style={{ background: '#050810', padding: '24px 20px' }}>
                    <div style={{ fontSize: 28, color: c, fontWeight: 300, marginBottom: 6 }}>{v}</div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Recent bookings preview */}
              <div style={{ background: '#0A0C14', border: '1px solid rgba(239,68,68,0.1)' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(239,68,68,0.08)', fontSize: 10, letterSpacing: 3, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif' }}>
                  ULTIME PRENOTAZIONI
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {mockBookings.slice(0, 3).map(bk => (
                      <tr key={bk.id} style={{ borderBottom: '1px solid rgba(239,68,68,0.05)' }}>
                        <td style={{ padding: '14px 24px', fontSize: 12, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif' }}>{bk.id}</td>
                        <td style={{ padding: '14px 8px', fontSize: 14 }}>{bk.client}</td>
                        <td style={{ padding: '14px 8px', fontSize: 13, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>{bk.route}</td>
                        <td style={{ padding: '14px 8px', fontSize: 14, color: '#C9A84C' }}>{formatCurrency(bk.total)}</td>
                        <td style={{ padding: '14px 8px', fontSize: 14, color: '#4ade80' }}>{formatCurrency(bk.commission)}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ fontSize: 11, color: statusColor[bk.status], fontFamily: 'Helvetica Neue, sans-serif' }}>● {bk.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>GESTIONE</div>
                  <h1 style={{ fontSize: 28, fontWeight: 300, margin: 0 }}>Utenti Piattaforma</h1>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                  {mockUsers.length} utenti totali · {mockUsers.filter(u => u.status === 'ACTIVE').length} attivi
                </div>
              </div>

              <div style={{ background: '#0A0C14', border: '1px solid rgba(239,68,68,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#030508', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                      {['ID', 'Utente', 'Ruolo', 'Voli', 'Spesa', 'Iscritto', 'Status', 'Azioni'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 9, letterSpacing: 2, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid rgba(239,68,68,0.05)', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '14px 16px', fontSize: 11, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif' }}>{user.id}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 14 }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>{user.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <select value={userRole[user.id]} onChange={e => setUserRole(prev => ({ ...prev, [user.id]: e.target.value }))}
                            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', padding: '4px 8px', fontSize: 11, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', outline: 'none' }}>
                            {['CLIENT', 'BROKER', 'ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: 'rgba(240,237,230,0.7)', fontFamily: 'Helvetica Neue, sans-serif' }}>{user.flights}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: '#C9A84C' }}>{formatCurrency(user.spent)}</td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>{user.joined}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 11, color: statusColor[user.status], fontFamily: 'Helvetica Neue, sans-serif' }}>● {user.status}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(240,237,230,0.5)', padding: '4px 10px', fontSize: 10, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>SALVA</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {tab === 'bookings' && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>GESTIONE</div>
              <h1 style={{ fontSize: 28, fontWeight: 300, margin: '0 0 32px' }}>Tutte le Prenotazioni</h1>

              <div style={{ background: '#0A0C14', border: '1px solid rgba(239,68,68,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#030508', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                      {['ID', 'Cliente', 'Rotta', 'Data', 'Velivolo', 'Totale', 'Commissione', 'Broker', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 9, letterSpacing: 2, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockBookings.map(bk => (
                      <tr key={bk.id} style={{ borderBottom: '1px solid rgba(239,68,68,0.05)', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '14px 16px', fontSize: 11, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif' }}>{bk.id}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14 }}>{bk.client}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif' }}>{bk.route}</td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>{bk.date}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif' }}>{bk.aircraft}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: '#C9A84C' }}>{formatCurrency(bk.total)}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: '#4ade80' }}>{formatCurrency(bk.commission)}</td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>{bk.broker}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 11, color: statusColor[bk.status], fontFamily: 'Helvetica Neue, sans-serif' }}>● {bk.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Revenue summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}>
                {[
                  ['Volume Totale', formatCurrency(mockBookings.reduce((s,b) => s+b.total, 0)), '#C9A84C'],
                  ['Commissioni Totali', formatCurrency(mockBookings.reduce((s,b) => s+b.commission, 0)), '#4ade80'],
                  ['Deal Medio', formatCurrency(Math.round(mockBookings.reduce((s,b) => s+b.total, 0) / mockBookings.length)), '#60a5fa'],
                ].map(([l, v, c]) => (
                  <div key={l as string} style={{ background: '#0A0C14', border: '1px solid rgba(239,68,68,0.1)', padding: '20px 24px' }}>
                    <div style={{ fontSize: 24, color: c as string, fontWeight: 300 }}>{v}</div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 6 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>CONFIGURAZIONE</div>
              <h1 style={{ fontSize: 28, fontWeight: 300, margin: '0 0 40px' }}>Impostazioni Piattaforma</h1>

              {[
                { label: 'COMMISSIONE DEFAULT', key: 'commission', value: '12', suffix: '%', desc: 'Percentuale applicata automaticamente a ogni booking' },
                { label: 'DEPOSITO DEFAULT', key: 'deposit', value: '30', suffix: '%', desc: 'Quota deposito richiesta al momento della prenotazione' },
                { label: 'SLA RISPOSTA (ore)', key: 'sla', value: '2', suffix: 'h', desc: 'Tempo massimo di risposta garantito al cliente' },
                { label: 'CACHE AVINODE (minuti)', key: 'cache', value: '15', suffix: 'min', desc: 'Durata cache dei prezzi Avinode' },
              ].map(({ label, key, value, suffix, desc }) => (
                <div key={key} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>{label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <input defaultValue={value} type="number"
                      style={{ background: '#0A0C14', border: '1px solid rgba(239,68,68,0.2)', color: '#F0EDE6', padding: '10px 14px', fontSize: 16, width: 100, outline: 'none', fontFamily: 'Cormorant Garamond, serif' }} />
                    <span style={{ color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>{suffix}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>{desc}</div>
                </div>
              ))}

              <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>BROKER EMAILS (ACCESSO AUTOMATICO)</div>
                <textarea defaultValue="corrado@aerojet.app" style={{ width: '100%', background: '#0A0C14', border: '1px solid rgba(239,68,68,0.2)', color: '#F0EDE6', padding: '12px 14px', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', outline: 'none', resize: 'vertical', minHeight: 80, lineHeight: 1.6, boxSizing: 'border-box' }} />
                <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 8 }}>Una email per riga. Questi account ricevono ruolo BROKER automaticamente al primo accesso.</div>
              </div>

              <button className="btn-gold" style={{ padding: '14px 36px' }} onClick={() => {
                const btn = document.activeElement as HTMLButtonElement
                if (btn) { btn.textContent = '✓ SALVATO'; btn.style.background = '#4ade80'; setTimeout(() => { btn.textContent = 'SALVA IMPOSTAZIONI'; btn.style.background = '#C9A84C' }, 2000) }
              }}>
                SALVA IMPOSTAZIONI
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
