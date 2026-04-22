'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/luxury/Navbar'
import type { Aircraft } from '@/lib/avinode'
import { formatCurrency, calcCommission } from '@/lib/utils'
import Link from 'next/link'

async function initiateCheckout(aircraft: Aircraft, from: string, to: string, date: string, pax: string) {
  const params = new URLSearchParams({
    aircraft: aircraft.model, operator: aircraft.operator, from, to, date, pax,
    price: String(aircraft.price), flightTime: aircraft.flightTime, category: aircraft.category,
  })
  window.location.href = `/booking?${params.toString()}`
}

function SearchResults() {
  const params = useSearchParams()
  const [results, setResults] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const date = params.get('date') || ''
  const pax = params.get('pax') || '2'

  useEffect(() => {
    const query = new URLSearchParams({ from, to, date, pax, fromICAO: params.get('fromICAO') || 'LIML', toICAO: params.get('toICAO') || 'EGLL' })
    setLoading(true)
    fetch(`/api/avinode/search?${query}`)
      .then(r => r.json())
      .then(d => { setResults(d.aircraft || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to, date, pax])

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 100 }}>

      {/* Search header */}
      <div style={{ background: '#0F1220', borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '24px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22, fontWeight: 400 }}>{from || 'Partenza'}</span>
            <span style={{ color: '#C9A84C', fontSize: 20 }}>→</span>
            <span style={{ fontSize: 22, fontWeight: 400 }}>{to || 'Destinazione'}</span>
            {date && <span style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>· {new Date(date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>}
            <span style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>· {pax} pax</span>
            <Link href="/" style={{ marginLeft: 'auto', fontSize: 12, letterSpacing: 2, color: '#C9A84C', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid rgba(201,168,76,0.3)', padding: '8px 16px' }}>
              ← NUOVA RICERCA
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 24, animation: 'pulse-gold 1s infinite', color: '#C9A84C' }}>✦</div>
            <p style={{ fontSize: 16, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>Ricerca aeromobili disponibili...</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 24, color: '#C9A84C' }}>✦</div>
            <p style={{ fontSize: 20, marginBottom: 12 }}>Nessun risultato trovato</p>
            <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>Prova con date o tratte diverse, oppure contatta il nostro concierge.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                {results.length} aeromobili disponibili
              </p>
              <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                {process.env.NODE_ENV === 'development' ? 'DEMO — Mock data attivi' : 'Prezzi aggiornati in tempo reale'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
              {results.map((ac) => (
                <div key={ac.id} onClick={() => setSelected(selected === ac.id ? null : ac.id)}
                  style={{ background: selected === ac.id ? '#141728' : '#0A0C14', padding: '28px 32px', cursor: 'pointer', transition: 'background 0.2s', borderLeft: selected === ac.id ? '3px solid #C9A84C' : '3px solid transparent' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>

                    {/* Logo operatore */}
                    <div style={{ width: 52, height: 52, background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C9A84C', flexShrink: 0, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid rgba(201,168,76,0.2)' }}>
                      {ac.operatorLogo}
                    </div>

                    {/* Info velivolo */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{ac.model}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', flexWrap: 'wrap' }}>
                        <span style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 2 }}>{ac.category.toUpperCase()}</span>
                        <span>· {ac.operator}</span>
                        <span>· Anno {ac.yearBuilt}</span>
                        <span>· max {ac.pax} pax</span>
                      </div>
                    </div>

                    {/* Volo info */}
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{ac.flightTime}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>durata</div>
                    </div>

                    {/* Rating */}
                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                      <div style={{ fontSize: 15, color: '#C9A84C' }}>★ {ac.rating}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>rating</div>
                    </div>

                    {/* Prezzo */}
                    <div style={{ textAlign: 'right', minWidth: 140 }}>
                      <div style={{ fontSize: 26, color: '#C9A84C', fontWeight: 300 }}>{formatCurrency(ac.price)}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>volo completo</div>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); initiateCheckout(ac, from, to, date, pax) }}
                      className="btn-gold" style={{ padding: '12px 24px', flexShrink: 0 }}>
                      DEPOSITO 30% →
                    </button>
                  </div>

                  {/* Expanded details */}
                  {selected === ac.id && (
                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(201,168,76,0.15)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>AUTONOMIA</div>
                        <div style={{ fontSize: 16 }}>{ac.range.toLocaleString('it-IT')} km</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>VELOCITÀ</div>
                        <div style={{ fontSize: 16 }}>{ac.speed} km/h</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>COMMISSIONE BROKER</div>
                        <div style={{ fontSize: 16, color: '#22c55e' }}>{formatCurrency(calcCommission(ac.price))}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>DOTAZIONI</div>
                        <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.6 }}>
                          {ac.amenities.join(' · ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontSize: 36 }}>✦</div>}>
        <SearchResults />
      </Suspense>
    </>
  )
}
