'use client'
import { use } from 'react'
import Link from 'next/link'
import Navbar from '@/components/luxury/Navbar'
import Footer from '@/components/luxury/Footer'

const routes: Record<string, {
  from: string; to: string; fromICAO: string; toICAO: string
  time: string; distance: string; category: string; priceFrom: string
  description: string
  jets: { model: string; time: string; price: string; pax: number }[]
  tips: string[]
  airports: { from: string; to: string }
}> = {
  'milano-londra': {
    from: 'Milano', to: 'Londra', fromICAO: 'LIML', toICAO: 'EGLL',
    time: '2h 10m', distance: '960 km', category: 'Light Jet', priceFrom: '€7,800',
    description: 'Il volo privato da Milano a Londra è tra i più richiesti in Europa. Con un Light Jet puoi raggiungere Londra in poco più di 2 ore, partendo da Linate o Malpensa e atterrando a Farnborough, Biggin Hill o Heathrow.',
    jets: [
      { model: 'Phenom 300E', time: '2h 05m', price: '€7,800', pax: 7 },
      { model: 'Citation CJ4', time: '2h 15m', price: '€8,200', pax: 6 },
      { model: 'Challenger 350', time: '2h 00m', price: '€12,500', pax: 10 },
    ],
    tips: ['Considera Farnborough (EGLF): zero file, 25 min verso il centro di Londra', 'Partenze mattutine per evitare venti contrari del pomeriggio', 'Empty legs su questa rotta quasi quotidiani'],
    airports: { from: 'Milano Linate (LIML) o Malpensa (LIMC)', to: 'Londra Farnborough (EGLF), Biggin Hill (EGKB) o Heathrow (EGLL)' },
  },
  'roma-dubai': {
    from: 'Roma', to: 'Dubai', fromICAO: 'LIRF', toICAO: 'OMDB',
    time: '5h 45m', distance: '3,200 km', category: 'Heavy Jet', priceFrom: '€38,000',
    description: 'Roma-Dubai è una rotta luxury per eccellenza. Richiede un Heavy Jet o Super Midsize per il volo non-stop. VistaJet e NetJets operano quotidianamente su questa tratta con configurazioni VIP.',
    jets: [
      { model: 'Falcon 7X', time: '5h 40m', price: '€42,000', pax: 16 },
      { model: 'Global 6000', time: '5h 30m', price: '€48,000', pax: 15 },
      { model: 'Gulfstream G650', time: '5h 45m', price: '€52,000', pax: 18 },
    ],
    tips: ['Dubai Al Maktoum (DWC) preferibile per l\'Aviation Club VIP', 'Finestra ideale: novembre-aprile', 'Possibile scalo tecnico ad Amman per missioni multi-destinazione'],
    airports: { from: 'Roma Fiumicino (LIRF)', to: 'Dubai Al Maktoum (DWC) o Dubai International (OMDB)' },
  },
  'milano-new-york': {
    from: 'Milano', to: 'New York', fromICAO: 'LIMC', toICAO: 'KTEB',
    time: '9h 30m', distance: '7,100 km', category: 'Ultra-Long Range', priceFrom: '€88,000',
    description: 'Il transatlantico per eccellenza. Solo i jet Ultra-Long Range possono collegare Milano a New York senza scalo. Global 7500 e Gulfstream G700 offrono cabine con camera da letto e doccia.',
    jets: [
      { model: 'Global 7500', time: '9h 20m', price: '€92,000', pax: 19 },
      { model: 'Gulfstream G700', time: '9h 30m', price: '€96,000', pax: 19 },
      { model: 'Falcon 10X', time: '9h 15m', price: '€98,000', pax: 16 },
    ],
    tips: ['Teterboro (KTEB): 20 min da Manhattan, zero code, niente Customs caos', 'Vola di notte — parti alle 21, atterra all\'01 locale dormendo a bordo', 'Global 7500: suite con letto reale e doccia — essenziale per 9+ ore'],
    airports: { from: 'Milano Malpensa (LIMC)', to: 'New York Teterboro (KTEB) o JFK (KJFK)' },
  },
}

export default function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const route = routes[slug]

  if (!route) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: '#C9A84C', marginBottom: 24 }}>✦</div>
          <h1 style={{ fontSize: 32, fontWeight: 300, marginBottom: 24 }}>Rotta non disponibile</h1>
          <Link href="/" className="btn-gold" style={{ padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>TORNA ALLA HOME</Link>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 100 }}>

        {/* Hero */}
        <div style={{ padding: '72px 48px', background: '#0F1220', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>VOLO PRIVATO</div>
            <h1 style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 300, lineHeight: 1.1, margin: '0 0 32px' }}>
              {route.from}<br /><span style={{ color: '#C9A84C', fontStyle: 'italic' }}>→ {route.to}</span>
            </h1>
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 40 }}>
              {[['DURATA', route.time], ['DISTANZA', route.distance], ['JET', route.category], ['DA', route.priceFrom]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 20, color: l === 'DA' ? '#C9A84C' : '#F0EDE6' }}>{v}</div>
                </div>
              ))}
            </div>
            <Link href={`/search?from=${route.from}&to=${route.to}&fromICAO=${route.fromICAO}&toICAO=${route.toICAO}`} className="btn-gold" style={{ padding: '16px 40px', textDecoration: 'none', display: 'inline-block' }}>
              CERCA DISPONIBILITÀ ✦
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 48px' }}>

          {/* Description + tips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, marginBottom: 64, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>LA ROTTA</div>
              <p style={{ fontSize: 17, color: 'rgba(240,237,230,0.7)', lineHeight: 1.85, fontWeight: 300, marginBottom: 36 }}>{route.description}</p>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>AEROPORTI</div>
              {[['PARTENZA', route.airports.from], ['ARRIVO', route.airports.to]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <span style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', width: 72, flexShrink: 0, paddingTop: 3 }}>{l}</span>
                  <span style={{ fontSize: 14, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', padding: 28 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>CONSIGLI CONCIERGE</div>
              {route.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                  <span style={{ color: '#C9A84C', flexShrink: 0 }}>✦</span>
                  <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7, margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Jets */}
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>JET CONSIGLIATI</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 64 }}>
            {route.jets.map((jet, i) => (
              <div key={i} style={{ background: '#0A0C14', padding: 28 }}>
                <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>{jet.model}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>
                  <span>⏱ {jet.time}</span><span>· max {jet.pax} pax</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 22, color: '#C9A84C', fontWeight: 300 }}>{jet.price}</span>
                  <Link href={`/search?from=${route.from}&to=${route.to}&fromICAO=${route.fromICAO}&toICAO=${route.toICAO}`} style={{ fontSize: 11, letterSpacing: 2, color: '#C9A84C', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid rgba(201,168,76,0.3)', padding: '8px 16px' }}>PRENOTA</Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: 48, textAlign: 'center' }}>
            <h2 style={{ fontSize: 36, fontWeight: 300, margin: '0 0 16px' }}>Prenota il Tuo Volo</h2>
            <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 32 }}>Conferma entro 2 ore · Concierge 24/7 · Nessuna commissione nascosta</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/search?from=${route.from}&to=${route.to}`} className="btn-gold" style={{ padding: '15px 36px', textDecoration: 'none', display: 'inline-block' }}>VERIFICA DISPONIBILITÀ</Link>
              <Link href="/#emptylegs" className="btn-outline-gold" style={{ padding: '15px 36px', textDecoration: 'none', display: 'inline-block' }}>CERCA EMPTY LEGS</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// Additional routes data injected at build
export {}
