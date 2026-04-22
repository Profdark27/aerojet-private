'use client'
import { useEffect, useRef, useState } from 'react'
import type { EmptyLeg } from '@/lib/avinode'

export default function EmptyLegsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [legs, setLegs] = useState<EmptyLeg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    fetch('/api/avinode/empty-legs')
      .then(r => r.json())
      .then(d => { setLegs(d.legs || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section id="emptylegs" style={{ padding: '100px 0', background: '#0F1220' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)', transition: 'all 0.9s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', display: 'block', marginBottom: 16 }}>OPPORTUNITÀ ESCLUSIVE</span>
            <h2 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 300, lineHeight: 1.1 }}>
              Empty Legs<br /><span style={{ color: '#C9A84C', fontStyle: 'italic' }}>Vola a Metà Prezzo</span>
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.55)', maxWidth: 340, fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, lineHeight: 1.8 }}>
            Quando un jet privato torna vuoto alla base, offriamo quei posti a tariffe eccezionali. Risparmio fino al <strong style={{ color: '#C9A84C' }}>75%</strong>.
          </p>
        </div>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, letterSpacing: 2, color: 'rgba(240,237,230,0.4)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-gold 2s infinite' }} />
          DISPONIBILITÀ IN TEMPO REALE
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 160, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 2, animation: 'pulse-gold 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
            {legs.map((leg, i) => (
              <div key={leg.id} style={{ background: '#0F1220', padding: 28, transition: 'background 0.2s', cursor: 'pointer', position: 'relative' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#141728')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0F1220')}>

                {/* Discount badge */}
                <div style={{ position: 'absolute', top: 20, right: 20, background: '#C9A84C', color: '#0A0C14', fontSize: 11, fontWeight: 700, padding: '3px 10px', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
                  -{leg.discountPct}%
                </div>

                {/* Route */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>{leg.fromCity}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{leg.fromICAO}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', color: '#C9A84C', fontSize: 18 }}>✦</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>{leg.toCity}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{leg.toICAO}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', flexWrap: 'wrap' }}>
                  <span>📅 {new Date(leg.departureDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} {leg.departureTime}</span>
                  <span>✈ {leg.aircraft}</span>
                  <span>👤 max {leg.pax} pax</span>
                </div>

                {/* Pricing */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', textDecoration: 'line-through' }}>
                      €{leg.originalPrice.toLocaleString('it-IT')}
                    </div>
                    <div style={{ fontSize: 24, color: '#C9A84C', fontWeight: 300 }}>
                      €{leg.discountedPrice.toLocaleString('it-IT')}
                    </div>
                  </div>
                  <button className="btn-gold" style={{ padding: '10px 20px' }}>
                    PRENOTA
                  </button>
                </div>

                {/* Expires */}
                <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                  Scade: {new Date(leg.expiresAt).toLocaleDateString('it-IT')} · {leg.operator}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>
            Le disponibilità si aggiornano ogni 15 minuti. Iscriviti per ricevere alert su misura.
          </p>
          <button className="btn-outline-gold" style={{ padding: '14px 40px' }}
            onClick={() => {
              const email = window.prompt('Inserisca la sua email per ricevere alert sugli empty legs:')
              if (!email) return
              fetch('/api/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                .then(r => r.json())
                .then(() => window.alert(`✦ Perfetto! Invieremo alert a ${email}`))
                .catch(() => window.alert('Si prega di riprovare.'))
            }}>
            ATTIVA ALERT EMPTY LEGS
          </button>
        </div>
      </div>
    </section>
  )
}
