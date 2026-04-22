'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// In production: fetch quote from DB by token
function mockQuoteByToken(token: string) {
  return {
    id: token || 'QT-SAMPLE',
    clientName: 'Marco Ferretti',
    from: 'Milano Linate',
    to: 'Londra Farnborough',
    date: '28 Aprile 2026',
    pax: 2,
    aircraft: 'Citation CJ4',
    operator: 'VistaJet',
    category: 'Light Jet',
    totalPrice: 8200,
    deposit: 2460,
    balance: 5740,
    commission: 984,
    validUntil: '24 Aprile 2026',
    brokerName: 'Corrado · Aerojet Private',
    extras: ['WiFi Starlink', 'Catering Gourmet'],
    status: 'PENDING',
  }
}

function QuoteAcceptContent() {
  const params = useSearchParams()
  const token = params.get('token') || 'QT-SAMPLE'
  const quote = mockQuoteByToken(token)
  const [status, setStatus] = useState<'view' | 'accepting' | 'accepted' | 'declined'>('view')
  const [declineReason, setDeclineReason] = useState('')

  const fmt = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

  const handleAccept = async () => {
    setStatus('accepting')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aircraft: { model: quote.aircraft, price: quote.totalPrice, category: quote.category, operator: quote.operator, operatorLogo: 'VJ' },
          from: quote.from, to: quote.to, date: quote.date, pax: String(quote.pax),
          customerEmail: '',
        }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch { setStatus('accepted') }
  }

  const isExpired = new Date(quote.validUntil) < new Date()

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 40, padding: '40px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48, justifyContent: 'center' }}>
          <span style={{ color: '#C9A84C', fontSize: 18 }}>✦</span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 6, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
          <span style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', alignSelf: 'flex-end', marginBottom: 2 }}>PRIVATE</span>
        </div>

        {status === 'accepted' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, color: '#C9A84C', marginBottom: 24 }}>✦</div>
            <h2 style={{ fontSize: 32, fontWeight: 300, marginBottom: 16 }}>Preventivo Accettato</h2>
            <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 32 }}>
              Il suo broker la contatterà entro 30 minuti per confermare i dettagli del pagamento.
            </p>
            <Link href="/" style={{ background: '#C9A84C', color: '#0A0C14', padding: '14px 32px', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, letterSpacing: 2, display: 'inline-block' }}>
              TORNA AL SITO
            </Link>
          </div>
        ) : status === 'declined' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, color: 'rgba(240,237,230,0.3)', marginBottom: 24 }}>✕</div>
            <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 16 }}>Preventivo Rifiutato</h2>
            <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 32 }}>
              Il suo broker sarà informato. Potete richiedere un nuovo preventivo in qualsiasi momento.
            </p>
            <Link href="/#contact" style={{ color: '#C9A84C', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, letterSpacing: 2, border: '1px solid rgba(201,168,76,0.3)', padding: '12px 24px', display: 'inline-block' }}>
              NUOVO PREVENTIVO
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>PREVENTIVO {quote.id}</div>
              <h1 style={{ fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Gentile {quote.clientName}</h1>
              <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7 }}>
                Il suo broker {quote.brokerName} ha preparato questo preventivo personalizzato.
                {isExpired && <span style={{ color: '#f87171', marginLeft: 8 }}>⚠ Scaduto il {quote.validUntil}</span>}
              </p>
            </div>

            {/* Flight details */}
            <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: 28, marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>DETTAGLI VOLO</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                <div style={{ fontSize: 20, fontWeight: 500 }}>{quote.from}</div>
                <div style={{ color: '#C9A84C', fontSize: 20 }}>→</div>
                <div style={{ fontSize: 20, fontWeight: 500 }}>{quote.to}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['Data', quote.date],
                  ['Passeggeri', `${quote.pax} persone`],
                  ['Velivolo', quote.aircraft],
                  ['Categoria', quote.category],
                  ['Operatore', quote.operator],
                  ['Extra', quote.extras.join(', ')],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize: 14 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: 28, marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>RIEPILOGO ECONOMICO</div>

              {[
                ['Totale charter', fmt(quote.totalPrice), '#F0EDE6', 20],
                ['Deposito ora (30%)', fmt(quote.deposit), '#C9A84C', 28],
                ['Saldo (72h prima del volo)', fmt(quote.balance), 'rgba(240,237,230,0.5)', 14],
              ].map(([label, value, color, size]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
                  <span style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13, color: 'rgba(240,237,230,0.5)' }}>{label}</span>
                  <span style={{ fontSize: size as number, color: color as string, fontWeight: 300 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Validity */}
            {!isExpired && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, padding: '12px 16px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-gold 2s infinite' }} />
                <span style={{ fontSize: 12, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                  Preventivo valido fino al {quote.validUntil} · Pagamento sicuro via Stripe
                </span>
              </div>
            )}

            {/* CTA */}
            {!isExpired ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleAccept} disabled={status === 'accepting'}
                  style={{ flex: 2, background: '#C9A84C', border: 'none', color: '#0A0C14', padding: '16px', fontSize: 12, letterSpacing: 2, cursor: status === 'accepting' ? 'not-allowed' : 'pointer', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 600, opacity: status === 'accepting' ? 0.6 : 1, transition: 'all 0.3s' }}>
                  {status === 'accepting' ? 'REINDIRIZZAMENTO...' : `✓ ACCETTO — PAGA ${fmt(quote.deposit)}`}
                </button>
                <button onClick={() => setStatus('declined')}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(240,237,230,0.15)', color: 'rgba(240,237,230,0.35)', padding: '16px', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', transition: 'all 0.2s' }}>
                  RIFIUTA
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p style={{ fontSize: 14, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>Questo preventivo è scaduto.</p>
                <Link href="/#contact" style={{ color: '#C9A84C', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, letterSpacing: 2 }}>
                  RICHIEDI NUOVO PREVENTIVO →
                </Link>
              </div>
            )}

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif' }}>
              Pagamento sicuro via Stripe · PCI DSS · Certificazione EASA/FAA
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function QuoteAcceptPage() {
  return <Suspense><QuoteAcceptContent /></Suspense>
}
