'use client'
import { useRef, useEffect, useState } from 'react'

const operators = [
  { name: 'VistaJet', logo: 'VJ', website: 'https://www.vistajet.com', fleet: '120+ aircraft', routes: 'Global', rating: 4.9, color: '#C41E3A', specialty: 'Ultra-long range & heavy jets', cert: 'EASA / FAA / CAAC' },
  { name: 'NetJets', logo: 'NJ', website: 'https://www.netjets.com', fleet: '750+ aircraft', routes: 'USA & Europe', rating: 4.8, color: '#1A1A2E', specialty: 'Fractional ownership programs', cert: 'FAA Part 135 / EASA' },
  { name: 'Air Charter Service', logo: 'AC', website: 'https://www.aircharterservice.com', fleet: '50,000+ partner jets', routes: 'Worldwide', rating: 4.7, color: '#0D3B66', specialty: 'Group charters & cargo', cert: 'IATA / ICAO' },
  { name: 'Wheels Up', logo: 'WU', website: 'https://www.wheelsup.com', fleet: '300+ aircraft', routes: 'North America', rating: 4.6, color: '#003087', specialty: 'Membership & on-demand', cert: 'FAA Part 135' },
  { name: 'Luxaviation', logo: 'LX', website: 'https://www.luxaviation.com', fleet: '260+ aircraft', routes: 'Europe & ME', rating: 4.8, color: '#2C3E50', specialty: 'VIP & VVIP configurations', cert: 'EASA Part-OPS' },
  { name: 'TAG Aviation', logo: 'TG', website: 'https://www.tagaviation.com', fleet: '80+ aircraft', routes: 'Europe & Asia', rating: 4.7, color: '#1B4332', specialty: 'Business jets & helicopters', cert: 'EASA / CAD Hong Kong' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 12, color: i <= Math.floor(rating) ? '#C9A84C' : 'rgba(201,168,76,0.25)' }}>★</span>
      ))}
      <span style={{ fontSize: 13, color: '#C9A84C', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  )
}

export default function OperatorsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="operators" style={{ padding: '100px 0', background: '#050810' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)', transition: 'all 0.9s ease' }}>

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', display: 'block', marginBottom: 16 }}>PARTNER CERTIFICATI</span>
          <h2 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 300, lineHeight: 1.1, margin: '0 0 20px' }}>
            Operatori di<br /><span style={{ color: '#C9A84C', fontStyle: 'italic' }}>Eccellenza</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(240,237,230,0.55)', maxWidth: 560, margin: '0 auto', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, lineHeight: 1.8 }}>
            Accesso diretto ai leader mondiali del charter privato. Ogni operatore è verificato EASA/FAA e certificato AOC.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
          {operators.map((op, i) => (
            <a key={i} href={op.website} target="_blank" rel="noopener noreferrer"
              style={{ background: '#050810', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24, textDecoration: 'none', color: 'inherit', transition: 'background 0.2s', flexWrap: 'wrap' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A0C14')}
              onMouseLeave={e => (e.currentTarget.style.background = '#050810')}>

              <div style={{ width: 56, height: 56, borderRadius: 4, background: op.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif' }}>
                {op.logo}
              </div>

              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{op.name}</div>
                <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>OPERATORE CERTIFICATO</div>
                <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', flexWrap: 'wrap' }}>
                  <span>✈ {op.fleet}</span>
                  <span>🌐 {op.routes}</span>
                  <span>🛡 {op.cert}</span>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', maxWidth: 220 }}>
                {op.specialty}
              </div>

              <div style={{ flexShrink: 0 }}>
                <Stars rating={op.rating} />
              </div>

              <div style={{ color: 'rgba(201,168,76,0.4)', fontSize: 18, flexShrink: 0, transition: 'all 0.2s' }}>→</div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, padding: 32, border: '1px solid rgba(201,168,76,0.1)', background: 'rgba(201,168,76,0.03)' }}>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>
            Accesso alla rete Avinode — oltre 4,500 operatori in 85 paesi
          </p>
          <a href="https://www.avinode.com/become-a-member" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', textDecoration: 'none' }}>
            ESPLORA TUTTA LA RETE AVINODE →
          </a>
        </div>
      </div>
    </section>
  )
}
