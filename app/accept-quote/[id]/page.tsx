import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { DEPOSIT_RATE } from '@/lib/stripe'
import PayButton from './PayButton'

export const dynamic = 'force-dynamic'

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
      <span style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 15, color: highlight ? '#C9A84C' : '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: highlight ? 600 : 400 }}>{value}</span>
    </div>
  )
}

export default async function AcceptQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { inquiry: true },
  })

  if (!quote || !quote.inquiry) {
    notFound()
  }

  const inquiry = quote.inquiry
  const now = new Date()
  const isExpired = quote.validUntil < now
  const alreadyPaid = inquiry.depositPaid

  const depositAmount = Math.round(quote.price * DEPOSIT_RATE)
  const remaining = quote.price - depositAmount

  const validUntilStr = quote.validUntil.toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const fromCity = inquiry.fromCity || 'N/D'
  const toCity = inquiry.toCity || 'N/D'
  const flightDate = inquiry.flightDate || 'Da definire'
  const pax = inquiry.pax || 1

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', color: '#F0EDE6', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>

      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(201,168,76,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 56 }}>
          <span style={{ color: '#C9A84C', fontSize: 18 }}>✦</span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 6, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>AEROJET</span>
          <span style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', alignSelf: 'flex-end', marginBottom: 2 }}>PRIVATE</span>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 12 }}>
            PREVENTIVO PERSONALIZZATO
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 300, margin: '0 0 8px', letterSpacing: 1 }}>
            {fromCity} → {toCity}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', margin: 0 }}>
            Gentile {inquiry.name}, il suo preventivo personalizzato è pronto.
          </p>
        </div>

        {/* Status banners */}
        {alreadyPaid && (
          <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', padding: '14px 20px', marginBottom: 28, borderRadius: 0 }}>
            <p style={{ color: '#4ade80', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', margin: 0, letterSpacing: 1 }}>
              ✓ Deposito già ricevuto — prenotazione in elaborazione
            </p>
          </div>
        )}

        {isExpired && !alreadyPaid && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', padding: '14px 20px', marginBottom: 28 }}>
            <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', margin: 0, letterSpacing: 1 }}>
              ⚠ Preventivo scaduto il {validUntilStr} — contatta il concierge per un aggiornamento
            </p>
          </div>
        )}

        {/* Quote details */}
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', padding: '32px', marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>
            DETTAGLI VOLO
          </div>
          <Row label="Velivolo" value={`${quote.aircraftModel} · ${quote.operatorName}`} />
          <Row label="Rotta" value={`${fromCity} → ${toCity}`} />
          <Row label="Data volo" value={flightDate} />
          <Row label="Passeggeri" value={`${pax} ${pax === 1 ? 'persona' : 'persone'}`} />
          <Row label="Valido fino al" value={validUntilStr} highlight={!isExpired} />
        </div>

        {/* Pricing breakdown */}
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: '32px', marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>
            RIEPILOGO ECONOMICO
          </div>

          {/* Total price */}
          <div style={{ textAlign: 'center', paddingBottom: 28, marginBottom: 28, borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>
              PREZZO TOTALE CHARTER
            </div>
            <div style={{ fontSize: 44, fontWeight: 300, color: '#F0EDE6', letterSpacing: 1 }}>
              €{quote.price.toLocaleString('it-IT')}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>
              {quote.currency}
            </div>
          </div>

          {/* Deposit / balance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
            <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>DEPOSITO (30%)</div>
              <div style={{ fontSize: 26, color: '#C9A84C', fontWeight: 300 }}>€{depositAmount.toLocaleString('it-IT')}</div>
              <div style={{ fontSize: 10, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>Da pagare ora</div>
            </div>
            <div style={{ background: '#0A0C14', border: '1px solid rgba(201,168,76,0.08)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>SALDO RESIDUO</div>
              <div style={{ fontSize: 26, color: 'rgba(240,237,230,0.6)', fontWeight: 300 }}>€{remaining.toLocaleString('it-IT')}</div>
              <div style={{ fontSize: 10, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>Entro 72h dal volo</div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', margin: '16px 0 0', lineHeight: 1.7 }}>
            Il prezzo include tutti i costi operativi, tasse aeroportuali e handling. Catering e servizi premium disponibili su richiesta al concierge.
          </p>
        </div>

        {/* CTA */}
        {!alreadyPaid && !isExpired && (
          <PayButton quoteId={quote.id} depositAmount={depositAmount} />
        )}

        {alreadyPaid && (
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p style={{ color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 14, margin: 0 }}>
              Il suo deposito è stato ricevuto. Il concierge la contatterà entro 2 ore.
            </p>
          </div>
        )}

        {isExpired && !alreadyPaid && (
          <a
            href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Buongiorno, vorrei rinnovare il preventivo per ${fromCity} → ${toCity} (ref. ${quote.id})`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', padding: '18px 48px', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, letterSpacing: 3 }}
          >
            RICHIEDI AGGIORNAMENTO PREVENTIVO
          </a>
        )}

        {/* Footer info */}
        <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 40, textAlign: 'center', lineHeight: 1.8 }}>
          Per assistenza: <a href={`mailto:${process.env.BROKER_EMAIL || 'concierge@aerojet-private.com'}`} style={{ color: '#C9A84C', textDecoration: 'none' }}>{process.env.BROKER_EMAIL || 'concierge@aerojet-private.com'}</a><br />
          Pagamento sicuro gestito da Stripe — nessun dato carta viene memorizzato da Aerojet Private
        </p>
      </div>
    </div>
  )
}
