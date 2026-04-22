'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'

function SuccessContent() {
  const params = useSearchParams()
  const mock = params.get('mock')
  const aircraft = params.get('aircraft') || 'Il suo jet'
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const deposit = params.get('deposit')
  const sessionId = params.get('session_id')

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const confCode = `AJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', justifyContent: 'center', marginBottom: 56 }}>
          <span style={{ color: '#C9A84C', fontSize: 20 }}>✦</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', alignSelf: 'flex-end' }}>PRIVATE</span>
        </Link>

        {/* Success icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: 36 }}>
          ✦
        </div>

        <h1 style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 300, marginBottom: 16, letterSpacing: 1 }}>
          Prenotazione Confermata
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 40 }}>
          Il suo volo privato {from && to ? <><strong style={{ color: '#F0EDE6' }}>{from} → {to}</strong></> : ''} è stato prenotato con successo.
        </p>

        {/* Booking card */}
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: '36px', marginBottom: 40, textAlign: 'left' }}>

          {/* Confirmation code */}
          <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>CODICE PRENOTAZIONE</div>
            <div style={{ fontSize: 32, letterSpacing: 6, color: '#C9A84C', fontWeight: 300 }}>{confCode}</div>
          </div>

          {/* Details */}
          {[
            ['Velivolo', aircraft],
            ['Rotta', from && to ? `${from} → ${to}` : 'Confermata'],
            ['Deposito pagato', deposit ? `€${parseInt(deposit).toLocaleString('it-IT')}` : 'Confermato'],
            ['Status', 'Confermato ✓'],
            ['Prossimo step', 'Il concierge La contatterà entro 2 ore'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
              <span style={{ fontSize: 12, letterSpacing: 1, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>{label}</span>
              <span style={{ fontSize: 14, color: label === 'Status' ? '#4ade80' : '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif' }}>{value}</span>
            </div>
          ))}
        </div>

        {mock && (
          <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', padding: '12px 20px', marginBottom: 32, fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', textAlign: 'center' }}>
            Modalità development — nessun pagamento reale effettuato
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-outline-gold" style={{ padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
            TORNA AL SITO
          </Link>
          <Link href="/dashboard" className="btn-gold" style={{ padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
            AREA PERSONALE
          </Link>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 40 }}>
          Una conferma è stata inviata alla sua email.<br />
          Per assistenza: <span style={{ color: '#C9A84C' }}>concierge@aerojet.private</span>
        </p>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
