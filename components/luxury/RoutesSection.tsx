'use client'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { POPULAR_ROUTES } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'
import { ROUTE_IMAGES } from '@/lib/imageAssets'

export default function RoutesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{ padding: '100px 0', background: '#0A0C14' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)', transition: 'all 0.9s ease' }}>

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', display: 'block', marginBottom: 16 }}>ROTTE POPOLARI</span>
          <h2 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 300, lineHeight: 1.1 }}>
            Destinazioni<br /><span style={{ color: '#C9A84C', fontStyle: 'italic' }}>Più Richieste</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
          {POPULAR_ROUTES.map((route, i) => (
            <div key={i} style={{ background: '#0A0C14', transition: 'background 0.2s', cursor: 'pointer', overflow: 'hidden' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0F1220')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0A0C14')}>

              {/* Destination image strip — 96px, falls back to gradient label */}
              <div style={{ position: 'relative', height: 96, overflow: 'hidden' }}>
                <ImageWithFallback
                  src={ROUTE_IMAGES[route.from] ?? ROUTE_IMAGES[route.to]}
                  alt={`Vista aerea di ${route.from}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  objectFit="cover"
                  fallback={
                    <div style={{
                      width: '100%', height: '100%',
                      background: 'linear-gradient(160deg, rgba(201,168,76,0.07) 0%, rgba(5,8,16,0.95) 100%)',
                      display: 'flex', alignItems: 'flex-end', padding: '10px 16px',
                    }}>
                      <span style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(201,168,76,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                        {route.from.toUpperCase()}
                      </span>
                    </div>
                  }
                />
                {/* Gradient blend into card */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'linear-gradient(to bottom, transparent, #0A0C14)', pointerEvents: 'none' }} />
              </div>

              <div style={{ padding: '20px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{route.from}</div>
                  <div style={{ fontSize: 12, color: '#C9A84C', letterSpacing: 2, margin: '4px 0' }}>————✦————</div>
                  <div style={{ fontSize: 22, fontWeight: 500 }}>{route.to}</div>
                </div>
                <div style={{ fontSize: 26, color: '#C9A84C', fontWeight: 300 }}>{route.price}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>⏱ {route.time}</span>
                <span style={{ fontSize: 11, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', flex: 1 }}>{route.category}</span>
                <Link href={`/search?from=${route.from}&to=${route.to}&fromICAO=${route.fromICAO}&toICAO=${route.toICAO}`}
                  style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(240,237,230,0.6)', padding: '7px 16px', fontSize: 11, letterSpacing: 1, textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.color = 'rgba(240,237,230,0.6)' }}>
                  Prenota
                </Link>
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
