'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FLEET_CATEGORIES } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'
import { FLEET_IMAGES, FLEET_ALT } from '@/lib/imageAssets'

export default function FleetSection() {
  const [selected, setSelected] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="fleet" style={{ padding: '100px 0', background: '#0A0C14' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)', transition: 'all 0.9s ease' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', display: 'block', marginBottom: 16 }}>LA FLOTTA</span>
          <h2 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 300, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: 1 }}>
            Scegli il Tuo<br /><span style={{ color: '#C9A84C', fontStyle: 'italic' }}>Velivolo</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(240,237,230,0.55)', maxWidth: 560, margin: '0 auto', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, lineHeight: 1.8 }}>
            Dalla tratta regionale al volo intercontinentale non-stop, ogni categoria è pensata per un&apos;esperienza diversa.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
          {FLEET_CATEGORIES.map((cat, i) => (
            <div key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{ background: selected === i ? '#0F1220' : '#0A0C14', padding: 32, cursor: 'pointer', borderLeft: selected === i ? '3px solid #C9A84C' : '3px solid transparent', transition: 'all 0.3s' }}
              onMouseEnter={e => { if (selected !== i) (e.currentTarget as HTMLElement).style.background = '#0D0F1A' }}
              onMouseLeave={e => { if (selected !== i) (e.currentTarget as HTMLElement).style.background = '#0A0C14' }}>
              <div style={{ fontSize: 24, color: '#C9A84C', marginBottom: 16 }}>{cat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{cat.label}</div>
              <div style={{ fontSize: 13, color: '#C9A84C', marginBottom: 12, fontFamily: 'Helvetica Neue, sans-serif' }}>{cat.priceHint}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', display: 'flex', gap: 8 }}>
                <span>{cat.range}</span>
                <span style={{ color: '#C9A84C' }}>·</span>
                <span>{cat.pax}</span>
              </div>

              {selected === i && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(201,168,76,0.15)' }}>

                  {/* Jet image — 180px panel, falls back to icon + gradient */}
                  <div style={{ position: 'relative', height: 180, overflow: 'hidden', marginBottom: 16 }}>
                    <ImageWithFallback
                      src={FLEET_IMAGES[cat.value]}
                      alt={FLEET_ALT[cat.value] ?? `${cat.label} in volo`}
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      objectFit="cover"
                      fallback={
                        <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.03) 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexDirection: 'column', gap: 8,
                        }}>
                          <span style={{ fontSize: 48, color: 'rgba(201,168,76,0.35)' }}>{cat.icon}</span>
                          <span style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(201,168,76,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                            {cat.label.toUpperCase()}
                          </span>
                        </div>
                      }
                    />
                    {/* Gradient overlay to blend into card background */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, transparent, #0F1220)', pointerEvents: 'none' }} />
                  </div>

                  <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7, marginBottom: 16 }}>
                    {cat.value === 'turboprop' && 'Ideale per tratte brevi, isole e aeroporti minori. Eccellente comfort per trasferimenti regionali.'}
                    {cat.value === 'light' && 'La scelta perfetta per viaggi business in Europa. Cabina moderna, velocità e puntualità.'}
                    {cat.value === 'midsize' && 'Cabina stand-up, ideale per 7-9 passeggeri. Copre la maggior parte delle rotte europee senza scalo.'}
                    {cat.value === 'supermid' && 'Non-stop Europa–East Coast USA. Cabina premium con letto flat-bed su richiesta.'}
                    {cat.value === 'heavy' && 'Intercontinentale con comfort massimo. Camera da letto, bagno completo, cucina di bordo.'}
                    {cat.value === 'ultralong' && 'Qualsiasi coppia di città sul pianeta senza scalo. L&apos;esperienza più esclusiva del trasporto privato.'}
                  </p>
                  <Link href={`/search?category=${cat.value}`}
                    style={{ display: 'block', background: '#C9A84C', color: '#0A0C14', textDecoration: 'none', textAlign: 'center', padding: '12px', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 500 }}>
                    RICHIEDI PREVENTIVO
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
