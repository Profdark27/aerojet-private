'use client'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/luxury/Navbar'
import { formatCurrency } from '@/lib/utils'

const mockHistory = [
  { id: 'BK-001', from: 'Milano', to: 'Londra', date: '12 Mar 2026', aircraft: 'Phenom 300E', price: 9800, status: 'COMPLETED', confirmCode: 'AJ-ABC123' },
  { id: 'BK-002', from: 'Roma', to: 'Parigi', date: '28 Jan 2026', aircraft: 'Citation XLS+', price: 11200, status: 'COMPLETED', confirmCode: 'AJ-DEF456' },
  { id: 'BK-003', from: 'Milano', to: 'Dubai', date: '05 Jun 2026', aircraft: 'Falcon 7X', price: 48500, status: 'CONFIRMED', confirmCode: 'AJ-GHI789' },
]

const statusStyle: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: 'Confermato', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
  COMPLETED: { label: 'Completato', color: 'rgba(240,237,230,0.35)', bg: 'rgba(240,237,230,0.05)' },
  CANCELLED: { label: 'Annullato', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'voli' | 'preferenze' | 'sicurezza'>('voli')

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 36, color: '#C9A84C', animation: 'pulse-gold 1s infinite' }}>✦</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 36, color: '#C9A84C' }}>✦</div>
        <p style={{ color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>Accesso richiesto</p>
        <Link href="/login" className="btn-gold" style={{ padding: '12px 32px', textDecoration: 'none' }}>ACCEDI</Link>
      </div>
    )
  }

  const totalSpent = mockHistory.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.price, 0)
  const totalFlights = mockHistory.length

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 100 }}>

        {/* Hero profile banner */}
        <div style={{ background: '#0F1220', borderBottom: '1px solid rgba(201,168,76,0.12)', padding: '48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 300, color: '#0A0C14', flexShrink: 0, fontFamily: 'Cormorant Garamond, serif' }}>
              {session.user?.name?.[0] || session.user?.email?.[0] || '✦'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>
                {session.user?.role} · MEMBRO
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 300, margin: '0 0 6px' }}>
                {session.user?.name || 'Membro Aerojet'}
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', margin: 0 }}>
                {session.user?.email}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 1, background: 'rgba(201,168,76,0.1)', flexShrink: 0 }}>
              {[
                { v: totalFlights.toString(), l: 'Voli' },
                { v: formatCurrency(totalSpent), l: 'Spesa totale' },
                { v: 'Silver', l: 'Membership' },
              ].map(({ v, l }) => (
                <div key={l} style={{ padding: '20px 28px', background: '#0F1220', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, color: '#C9A84C', fontWeight: 300 }}>{v}</div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>

            <button onClick={() => signOut({ callbackUrl: '/' })}
              className="btn-outline-gold" style={{ padding: '11px 22px', flexShrink: 0 }}>
              ESCI
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,168,76,0.1)', marginBottom: 40 }}>
            {(['voli', 'preferenze', 'sicurezza'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '20px 24px', background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid #C9A84C' : '2px solid transparent', color: activeTab === t ? '#C9A84C' : 'rgba(240,237,230,0.4)', fontSize: 12, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', textTransform: 'capitalize', marginBottom: -1, transition: 'all 0.2s' }}>
                {t === 'voli' ? 'I Miei Voli' : t === 'preferenze' ? 'Preferenze' : 'Sicurezza'}
              </button>
            ))}
          </div>

          {/* VOLI */}
          {activeTab === 'voli' && (
            <div>
              {mockHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 48, color: '#C9A84C', marginBottom: 24 }}>✦</div>
                  <p style={{ fontSize: 18, fontWeight: 300, marginBottom: 12 }}>Nessun volo ancora</p>
                  <Link href="/search" className="btn-gold" style={{ padding: '12px 32px', textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>CERCA UN VOLO</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
                  {mockHistory.map(bk => {
                    const s = statusStyle[bk.status]
                    return (
                      <div key={bk.id} style={{ background: '#0A0C14', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#0D0F1A')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#0A0C14')}>

                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                            <span style={{ fontSize: 18, fontWeight: 500 }}>{bk.from}</span>
                            <span style={{ color: '#C9A84C' }}>→</span>
                            <span style={{ fontSize: 18, fontWeight: 500 }}>{bk.to}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                            {bk.date} · {bk.aircraft}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', minWidth: 100 }}>
                          <div style={{ fontSize: 18, color: '#C9A84C' }}>{formatCurrency(bk.price)}</div>
                          <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>charter</div>
                        </div>

                        <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '5px 12px', letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif' }}>
                          {s.label}
                        </span>

                        <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
                          {bk.confirmCode}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <Link href="/search" className="btn-gold" style={{ padding: '14px 40px', textDecoration: 'none', display: 'inline-block' }}>
                  + PRENOTA UN NUOVO VOLO
                </Link>
              </div>
            </div>
          )}

          {/* PREFERENZE */}
          {activeTab === 'preferenze' && (
            <div style={{ maxWidth: 600 }}>
              {[
                { label: 'Categoria jet preferita', value: 'Heavy Jet', type: 'select', options: ['Turboprop', 'Light Jet', 'Midsize', 'Super Midsize', 'Heavy Jet', 'Ultra-Long'] },
                { label: 'Catering', value: 'Gourmet italiano', type: 'text' },
                { label: 'Temperatura cabina', value: '22°C', type: 'text' },
                { label: 'Giornali preferiti', value: 'Il Sole 24 Ore, FT', type: 'text' },
                { label: 'Note speciali', value: 'Allergia ai crostacei', type: 'text' },
              ].map(({ label, value, type, options }) => (
                <div key={label} style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>{label.toUpperCase()}</div>
                  {type === 'select' ? (
                    <select className="luxury-input" defaultValue={value} style={{ maxWidth: 280 }}>
                      {options?.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="luxury-input" defaultValue={value} style={{ maxWidth: 400 }} />
                  )}
                </div>
              ))}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>NOTIFICHE EMAIL</div>
                {['Alert Empty Legs', 'Conferme prenotazione', 'Newsletter mensile', 'Offerte speciali'].map(item => (
                  <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#C9A84C', width: 16, height: 16 }} />
                    <span style={{ fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', color: 'rgba(240,237,230,0.7)' }}>{item}</span>
                  </label>
                ))}
              </div>

              <button className="btn-gold" style={{ padding: '13px 32px', marginTop: 24 }}>SALVA PREFERENZE</button>
            </div>
          )}

          {/* SICUREZZA */}
          {activeTab === 'sicurezza' && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '28px 32px', marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 400, marginBottom: 8 }}>Metodo di accesso</div>
                <div style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>
                  {session.user?.email ? `Magic Link · ${session.user.email}` : 'Google OAuth'}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                  ✓ Autenticazione sicura senza password
                </div>
              </div>

              <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '28px 32px', marginBottom: 32 }}>
                <div style={{ fontSize: 16, fontWeight: 400, marginBottom: 8 }}>Sessioni attive</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                    Sessione corrente · Attiva ora
                  </div>
                  <span style={{ fontSize: 11, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif' }}>● ATTIVA</span>
                </div>
              </div>

              <button onClick={() => signOut({ callbackUrl: '/' })}
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '12px 28px', fontSize: 12, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>
                DISCONNETTI TUTTE LE SESSIONI
              </button>
            </div>
          )}

          <div style={{ height: 80 }} />
        </div>
      </div>
    </>
  )
}
