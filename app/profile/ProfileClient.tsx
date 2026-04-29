'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/luxury/Navbar'
import { formatCurrency } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { ROUTE_IMAGES, FLEET_IMAGES } from '@/lib/imageAssets'
import ImageWithFallback from '@/components/ImageWithFallback'

function routeImg(city: string | null): string | undefined {
  if (!city) return undefined
  const c = city.toLowerCase()
  for (const [key, path] of Object.entries(ROUTE_IMAGES)) {
    if (c.includes(key.toLowerCase()) || key.toLowerCase().includes(c.split(' ')[0])) return path
  }
  return undefined
}

function fleetImg(model: string): string | undefined {
  const m = model.toLowerCase()
  if (m.includes('pc-12') || m.includes('king air') || m.includes('tbm')) return FLEET_IMAGES['turboprop']
  if (m.includes('phenom') || m.includes(' cj') || m.includes('mustang')) return FLEET_IMAGES['light']
  if (m.includes('challenger 3') || m.includes('citation xls') || m.includes('hawker')) return FLEET_IMAGES['midsize']
  if (m.includes('latitude') || m.includes('falcon 2000') || m.includes('g4')) return FLEET_IMAGES['supermid']
  if (m.includes('falcon 7') || m.includes('falcon 8') || m.includes('global 6') || m.includes('g550')) return FLEET_IMAGES['heavy']
  if (m.includes('global 7') || m.includes('g700') || m.includes('g650')) return FLEET_IMAGES['ultralong']
  return undefined
}

type SessionUser = {
  id?: string
  name?: string | null
  email?: string | null
  role?: string
}

type QuoteType = {
  id: string
  operatorName: string
  aircraftModel: string
  price: number
  status: string
}

type InquiryType = {
  id: string
  fromCity: string | null
  toCity: string | null
  flightDate: string | null
  status: string
  quotes: QuoteType[]
}

type BookingType = {
  id: string
  fromCity: string
  toCity: string
  departureDate: Date
  jetCategory: string | null
  totalPrice: number | null
  status: string
  confirmCode: string | null
  depositPaid: boolean
}

const statusStyle: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: 'Confermato', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
  COMPLETED: { label: 'Completato', color: 'rgba(240,237,230,0.35)', bg: 'rgba(240,237,230,0.05)' },
  CANCELLED: { label: 'Annullato', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  PENDING: { label: 'In Attesa', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  NEW: { label: 'Ricevuto', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  QUOTED: { label: 'Preventivo Pronto', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)' }
}

export default function ProfileClient({
  sessionUser,
  inquiries,
  bookings
}: {
  sessionUser: SessionUser
  inquiries: InquiryType[]
  bookings: BookingType[]
}) {
  const [activeTab, setActiveTab] = useState<'voli' | 'preferenze' | 'sicurezza'>('voli')

  const totalSpent = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED').reduce((s, b) => s + (b.totalPrice || 0), 0)
  const totalFlights = bookings.length

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 100 }}>

        {/* Hero profile banner */}
        <div style={{ background: '#0F1220', borderBottom: '1px solid rgba(201,168,76,0.12)', padding: '48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 300, color: '#0A0C14', flexShrink: 0, fontFamily: 'Cormorant Garamond, serif' }}>
              {sessionUser.name?.[0] || sessionUser.email?.[0] || '✦'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                {sessionUser.role} · MEMBRO
                <span style={{ background: '#0A0C14', border: '1px solid #C9A84C', padding: '2px 8px', color: '#C9A84C', fontSize: 9, letterSpacing: 2 }}>Aerojet Member</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 300, margin: '0 0 6px' }}>
                {sessionUser.name || 'Membro Aerojet'}
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', margin: 0 }}>
                {sessionUser.email}
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
              {inquiries.length === 0 && bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 48, color: '#C9A84C', marginBottom: 24 }}>✦</div>
                  <p style={{ fontSize: 18, fontWeight: 300, marginBottom: 12 }}>Nessun volo o richiesta ancora</p>
                  <Link href="/search" className="btn-gold" style={{ padding: '12px 32px', textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>CERCA UN VOLO</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                  {/* PRENOTAZIONI CONFERMATE */}
                  {bookings.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 300, color: '#C9A84C', marginBottom: 16 }}>Prenotazioni</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
                        {bookings.map(bk => {
                          const s = statusStyle[bk.status] || statusStyle['PENDING']
                          const thumb = routeImg(bk.toCity) ?? routeImg(bk.fromCity)
                          return (
                            <div key={bk.id} style={{ background: '#0A0C14', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', transition: 'background 0.2s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#0D0F1A')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#0A0C14')}>

                              {thumb && (
                                <div style={{ position: 'relative', width: 72, height: 44, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(201,168,76,0.1)' }}>
                                  <ImageWithFallback src={thumb} alt={bk.toCity} fill sizes="72px" objectFit="cover" fallback={<></>} />
                                </div>
                              )}

                              <div style={{ flex: 1, minWidth: 180 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                  <span style={{ fontSize: 18, fontWeight: 500 }}>{bk.fromCity}</span>
                                  <span style={{ color: '#C9A84C' }}>→</span>
                                  <span style={{ fontSize: 18, fontWeight: 500 }}>{bk.toCity}</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                                  {new Date(bk.departureDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })} · {bk.jetCategory || 'N/A'}
                                </div>
                              </div>

                              <div style={{ textAlign: 'center', minWidth: 100 }}>
                                <div style={{ fontSize: 18, color: '#C9A84C' }}>{bk.totalPrice ? formatCurrency(bk.totalPrice) : '-'}</div>
                                <div style={{ fontSize: 11, color: bk.depositPaid ? '#4ade80' : 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                                  {bk.depositPaid ? 'Deposito Pagato' : 'Da Pagare'}
                                </div>
                              </div>

                              <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '5px 12px', letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif' }}>
                                {s.label}
                              </span>

                              <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
                                {bk.confirmCode || 'IN ATTESA'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* RICHIESTE E PREVENTIVI */}
                  {inquiries.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 300, color: '#C9A84C', marginBottom: 16 }}>Richieste in corso</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
                        {inquiries.map(inq => {
                          const s = statusStyle[inq.quotes.length > 0 ? 'QUOTED' : inq.status] || statusStyle['NEW']
                          return (
                            <div key={inq.id} style={{ background: '#0A0C14', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16, transition: 'background 0.2s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#0D0F1A')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#0A0C14')}>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                    <span style={{ fontSize: 18, fontWeight: 500 }}>{inq.fromCity || 'N/A'}</span>
                                    <span style={{ color: '#C9A84C' }}>→</span>
                                    <span style={{ fontSize: 18, fontWeight: 500 }}>{inq.toCity || 'N/A'}</span>
                                  </div>
                                  <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                                    {inq.flightDate || 'Data flessibile'}
                                  </div>
                                </div>

                                <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '5px 12px', letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif' }}>
                                  {s.label}
                                </span>
                              </div>

                              {/* MOSTRA I PREVENTIVI SE CI SONO */}
                              {inq.quotes.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: 16 }}>
                                  <div style={{ fontSize: 12, color: '#C9A84C', letterSpacing: 1, textTransform: 'uppercase' }}>Preventivi Ricevuti:</div>
                                  {inq.quotes.map(quote => {
                                    const jImg = fleetImg(quote.aircraftModel)
                                    return (
                                    <div key={quote.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {jImg && (
                                          <div style={{ position: 'relative', width: 56, height: 34, overflow: 'hidden', flexShrink: 0 }}>
                                            <ImageWithFallback src={jImg} alt={quote.aircraftModel} fill sizes="56px" objectFit="cover" fallback={<></>} />
                                          </div>
                                        )}
                                        <div>
                                          <div style={{ fontSize: 14, fontWeight: 500 }}>{quote.aircraftModel}</div>
                                          <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>{quote.operatorName}</div>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                        <div style={{ fontSize: 16, color: '#C9A84C' }}>{formatCurrency(quote.price)}</div>
                                        <Link href={`/accept-quote/${quote.id}`} className="btn-gold" style={{ padding: '8px 24px', fontSize: 12, textDecoration: 'none' }}>
                                          APRI PREVENTIVO
                                        </Link>
                                      </div>
                                    </div>
                                  )})}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

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
                  {sessionUser.email ? `Magic Link · ${sessionUser.email}` : 'Google OAuth'}
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
