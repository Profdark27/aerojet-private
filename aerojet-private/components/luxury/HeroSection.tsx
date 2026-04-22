'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import CityAutocomplete from './CityAutocomplete'

export default function HeroSection() {
  const router = useRouter()
  const [tab, setTab] = useState<'oneway'|'roundtrip'|'multistop'>('oneway')
  const [from, setFrom] = useState('')
  const [fromICAO, setFromICAO] = useState('')
  const [to, setTo] = useState('')
  const [toICAO, setToICAO] = useState('')
  const [date, setDate] = useState('')
  const [pax, setPax] = useState('2')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const stars = useMemo(() => Array.from({ length: 70 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  })), [])

  const handleSearch = () => {
    const params = new URLSearchParams({ from, to, date, pax, fromICAO, toICAO })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '120px 24px 80px' }}>

      {/* Stars */}
      {mounted && stars.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: '50%', background: '#C9A84C', animation: `twinkle ${s.duration}s ${s.delay}s infinite alternate`, pointerEvents: 'none' }} />
      ))}

      {/* Background glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 80% 80%, rgba(13,59,102,0.12) 0%, transparent 50%)', pointerEvents: 'none' }} />

      {/* Grid pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 960, width: '100%' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '8px 24px', fontSize: 12, letterSpacing: 2, color: '#C9A84C', marginBottom: 36, fontFamily: 'Helvetica Neue, sans-serif' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', display: 'inline-block', animation: 'pulse-gold 2s infinite' }} />
          Accesso diretto a 8,000+ aeromobili certificati
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(52px, 9vw, 104px)', fontWeight: 300, lineHeight: 1.0, margin: '0 0 28px', letterSpacing: 2 }}>
          Il Cielo<br />
          <span className="text-shimmer" style={{ fontStyle: 'italic' }}>è il Limite</span>
        </h1>

        <p style={{ fontSize: 18, color: 'rgba(240,237,230,0.6)', lineHeight: 1.8, margin: '0 0 52px', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, letterSpacing: 0.5 }}>
          Prenota voli privati con i migliori operatori mondiali.<br className="desktop-only" />
          Decollo entro 4 ore. Qualunque destinazione.
        </p>

        {/* Booking Widget */}
        <div style={{ background: 'rgba(10,12,20,0.88)', border: '1px solid rgba(201,168,76,0.2)', backdropFilter: 'blur(20px)', width: '100%', maxWidth: 900, margin: '0 auto' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
            {[['oneway', 'Solo Andata'], ['roundtrip', 'A/R'], ['multistop', 'Multi-tappa']].map(([val, label]) => (
              <button key={val} onClick={() => setTab(val as typeof tab)} style={{ flex: 1, padding: '14px 8px', background: 'transparent', border: 'none', borderBottom: tab === val ? '2px solid #C9A84C' : '2px solid transparent', marginBottom: -1, color: tab === val ? '#C9A84C' : 'rgba(240,237,230,0.4)', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '28px 24px', gap: 8, flexWrap: 'wrap' }}>

            <CityAutocomplete label="PARTENZA" value={from} onChange={(city, icao) => { setFrom(city); setFromICAO(icao) }} style={{ flex: 2, minWidth: 140, padding: '0 12px' }} />

            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8, color: '#C9A84C', fontSize: 20, padding: '0 4px 8px' }}>→</div>

            <CityAutocomplete label="DESTINAZIONE" value={to} onChange={(city, icao) => { setTo(city); setToICAO(icao) }} style={{ flex: 2, minWidth: 140, padding: '0 12px' }} />

            <div style={{ flex: 1.5, minWidth: 120, padding: '0 12px' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 8, fontFamily: 'Helvetica Neue, sans-serif' }}>DATA</div>
              <input className="luxury-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div style={{ flex: 1, minWidth: 100, padding: '0 12px' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 8, fontFamily: 'Helvetica Neue, sans-serif' }}>PAX</div>
              <select className="luxury-input" value={pax} onChange={e => setPax(e.target.value)}>
                {[1,2,3,4,5,6,7,8,9,10,12,14,16,18].map(n => (
                  <option key={n} value={n}>{n} {n===1?'pax':'pax'}</option>
                ))}
              </select>
            </div>

            <button onClick={handleSearch} className="btn-gold" style={{ padding: '16px 32px', whiteSpace: 'nowrap', marginLeft: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              CERCA ✦
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
          {['EASA Certificato', 'FAA Approvato', 'AOC Verificato', 'Assicurazione Full'].map(badge => (
            <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(240,237,230,0.45)', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif' }}>
              <span style={{ color: '#C9A84C' }}>✓</span> {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, #C9A84C, transparent)', animation: 'scrollLine 2s infinite' }} />
        <span style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>SCOPRI</span>
      </div>
    </section>
  )
}
