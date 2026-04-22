'use client'
import { useRef, useEffect, useState } from 'react'

const plans = [
  {
    name: 'Silver',
    price: '€2,500',
    period: 'anno',
    color: '#9E9E9E',
    perks: ['Sconto 5% su ogni volo', 'Priorità nelle prenotazioni', 'Concierge email 24/7', 'Newsletter Empty Legs esclusiva', 'Accesso app mobile premium'],
  },
  {
    name: 'Gold',
    price: '€8,500',
    period: 'anno',
    color: '#C9A84C',
    featured: true,
    perks: ['Sconto 10% su ogni volo', 'Jet card 25h inclusa', 'Concierge telefono 24/7', 'Accesso sale VIP aeroporto', 'Transfer limousine incluso', 'Catering premium a bordo'],
  },
  {
    name: 'Obsidian',
    price: 'Su richiesta',
    period: '',
    color: '#E8E8E8',
    dark: true,
    perks: ['Sconto 18% su ogni volo', 'Jet card 100h inclusa', 'Jet manager dedicato', 'Catering Michelin a bordo', 'Elicottero last-mile incluso', 'Priority hangar storage'],
  },
]

export default function MembershipSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="membership" style={{ padding: '100px 0', background: '#050810' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)', transition: 'all 0.9s ease' }}>

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', display: 'block', marginBottom: 16 }}>MEMBERSHIP</span>
          <h2 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 300, lineHeight: 1.1, margin: '0 0 20px' }}>
            Accesso<br /><span style={{ color: '#C9A84C', fontStyle: 'italic' }}>Privilegiato</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(240,237,230,0.55)', maxWidth: 520, margin: '0 auto', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, lineHeight: 1.8 }}>
            Un piano su misura per chi vola con regolarità. Più voli, più risparmi, più servizi.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
          {plans.map((plan, i) => (
            <div key={i} style={{ background: plan.featured ? '#0F1220' : '#050810', padding: '48px 36px', position: 'relative', border: plan.featured ? `2px solid ${plan.color}` : '2px solid transparent', transition: 'all 0.3s' }}
              onMouseEnter={e => !plan.featured && ((e.currentTarget as HTMLElement).style.background = '#0A0C14')}
              onMouseLeave={e => !plan.featured && ((e.currentTarget as HTMLElement).style.background = '#050810')}>

              {plan.featured && (
                <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#0A0C14', fontSize: 10, letterSpacing: 3, padding: '5px 20px', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  PIÙ SCELTO
                </div>
              )}

              <div style={{ fontSize: 'clamp(28px,3vw,36px)', fontWeight: 300, letterSpacing: 4, color: plan.color, marginBottom: 8, fontFamily: 'Cormorant Garamond, serif' }}>
                {plan.name}
              </div>
              <div style={{ fontSize: 28, fontWeight: 300, marginBottom: 4 }}>{plan.price}</div>
              {plan.period && <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 32 }}>per {plan.period}</div>}
              {!plan.period && <div style={{ marginBottom: 32 }} />}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
                {plan.perks.map((perk, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', color: 'rgba(240,237,230,0.75)' }}>
                    <span style={{ color: plan.color, flexShrink: 0 }}>✦</span>
                    {perk}
                  </div>
                ))}
              </div>

              <button style={{ width: '100%', padding: 16, fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: plan.featured ? plan.color : 'transparent', color: plan.featured ? '#0A0C14' : plan.color, border: `1px solid ${plan.color}`, transition: 'all 0.3s' }}
                onMouseEnter={e => { if (!plan.featured) { (e.currentTarget as HTMLElement).style.background = plan.color; (e.currentTarget as HTMLElement).style.color = '#0A0C14' } }}
                onMouseLeave={e => { if (!plan.featured) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = plan.color } }}>
                RICHIEDI ACCESSO
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 40, fontSize: 13, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>
          Tutti i piani includono IVA. Cancellazione entro 30 giorni senza penale.
        </p>
      </div>
    </section>
  )
}
