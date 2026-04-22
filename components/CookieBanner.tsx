'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('aerojet-cookie-consent')
    if (!consent) setTimeout(() => setVisible(true), 1500)
  }, [])

  const accept = (all: boolean) => {
    localStorage.setItem('aerojet-cookie-consent', JSON.stringify({
      essential: true,
      analytics: all || analytics,
      acceptedAt: new Date().toISOString(),
    }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990,
      background: 'rgba(10,12,20,0.98)', borderTop: '1px solid rgba(201,168,76,0.2)',
      backdropFilter: 'blur(20px)',
      animation: 'slideUp 0.4s ease',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px' }}>
        {!showDetails ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#C9A84C', fontSize: 16 }}>✦</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#F0EDE6' }}>Informativa Cookie</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7, margin: 0 }}>
                Utilizziamo cookie tecnici necessari e, con il suo consenso, cookie analitici anonimi per migliorare la piattaforma.{' '}
                <button onClick={() => setShowDetails(true)} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', padding: 0, textDecoration: 'underline' }}>
                  Personalizza
                </button>
                {' '}·{' '}
                <Link href="/privacy" style={{ color: '#C9A84C', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>Privacy Policy</Link>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              <button onClick={() => accept(false)} className="btn-outline-gold" style={{ padding: '10px 20px', fontSize: 11, letterSpacing: 2, whiteSpace: 'nowrap' }}>
                SOLO ESSENZIALI
              </button>
              <button onClick={() => accept(true)} className="btn-gold" style={{ padding: '10px 24px', fontSize: 11, letterSpacing: 2, whiteSpace: 'nowrap' }}>
                ACCETTA TUTTI
              </button>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 680 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>GESTIONE COOKIE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {[
                { name: 'Cookie Tecnici (Essenziali)', desc: 'Sessione, autenticazione, sicurezza. Non disattivabili — necessari al funzionamento.', checked: true, disabled: true },
                { name: 'Cookie Analitici', desc: 'Dati aggregati e anonimi su utilizzo piattaforma. Nessun dato personale.', checked: analytics, disabled: false, onChange: () => setAnalytics(a => !a) },
              ].map(({ name, desc, checked, disabled, onChange }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 16px', background: '#0F1220', border: '1px solid rgba(201,168,76,0.1)' }}>
                  <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange}
                      style={{ width: 18, height: 18, accentColor: '#C9A84C', cursor: disabled ? 'not-allowed' : 'pointer' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4, color: disabled ? 'rgba(240,237,230,0.5)' : '#F0EDE6' }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDetails(false)} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(240,237,230,0.4)', padding: '10px 20px', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>← INDIETRO</button>
              <button onClick={() => accept(false)} className="btn-gold" style={{ flex: 1, padding: '10px', fontSize: 11, letterSpacing: 2 }}>SALVA PREFERENZE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
