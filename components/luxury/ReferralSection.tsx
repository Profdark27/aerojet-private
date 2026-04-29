'use client'
import { useState, useEffect } from 'react'
import { useSession } from '@/lib/useDevSession'

interface Referral {
  code: string; uses: number; earnings: number
}

export default function ReferralSection() {
  const { data: session } = useSession()
  const [referral, setReferral] = useState<Referral | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!session?.user?.email) return
    fetch(`/api/referrals?email=${session.user.email}`)
      .then(r => r.json())
      .then(d => setReferral(d.referral))
  }, [session])

  const generateCode = async () => {
    if (!session?.user?.email || !session?.user?.name) return
    setLoading(true)
    const res = await fetch('/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerEmail: session.user.email, ownerName: session.user.name }),
    })
    const data = await res.json()
    setReferral(data.referral)
    setLoading(false)
  }

  const copy = () => {
    if (!referral) return
    const url = `https://aerojet.app/?ref=${referral.code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    if (!referral) return
    const msg = `Ho scoperto Aerojet Private per i voli privati in Italia e nel mondo. Usa il mio codice ${referral.code} per avere un vantaggio esclusivo: https://aerojet.app/?ref=${referral.code}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', padding: 28, marginTop: 32 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>PROGRAMMA REFERRAL</div>
      <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 20 }}>
        Invita un amico su Aerojet Private. Per ogni prenotazione completata tramite il tuo link, ricevi il <strong style={{ color: '#C9A84C' }}>5% di cashback</strong> sulle tue future prenotazioni.
      </p>

      {!referral ? (
        <button onClick={generateCode} disabled={loading}
          style={{ background: '#C9A84C', border: 'none', color: '#0A0C14', padding: '12px 28px', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 500 }}>
          {loading ? 'GENERAZIONE...' : 'GENERA IL TUO CODICE REFERRAL'}
        </button>
      ) : (
        <div>
          {/* Code display */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#0A0C14', border: '1px solid rgba(201,168,76,0.3)', padding: '12px 24px', flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>IL TUO CODICE</div>
              <div style={{ fontSize: 22, letterSpacing: 4, color: '#C9A84C' }}>{referral.code}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={copy} style={{ background: copied ? '#4ade80' : 'transparent', border: `1px solid ${copied ? '#4ade80' : 'rgba(201,168,76,0.3)'}`, color: copied ? '#0A0C14' : '#C9A84C', padding: '10px 16px', fontSize: 11, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', transition: 'all 0.2s' }}>
                {copied ? '✓ COPIATO' : 'COPIA LINK'}
              </button>
              <button onClick={shareWhatsApp} style={{ background: '#25D366', border: 'none', color: '#fff', padding: '10px 16px', fontSize: 11, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 1, background: 'rgba(201,168,76,0.08)' }}>
            <div style={{ flex: 1, background: '#0A0C14', padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, color: '#C9A84C' }}>{referral.uses}</div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>INVITI USATI</div>
            </div>
            <div style={{ flex: 1, background: '#0A0C14', padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, color: '#4ade80' }}>€{referral.earnings.toLocaleString('it-IT')}</div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>CASHBACK TOTALE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
