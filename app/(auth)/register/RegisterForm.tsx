'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function RegisterFormInner({ googleEnabled }: { googleEnabled: boolean }) {
  const params = useSearchParams()
  const [step, setStep] = useState<'type' | 'form' | 'sent'>('type')
  const [type, setType] = useState<'client' | 'broker'>('client')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!email || !name) return
    setLoading(true)
    try {
      await signIn('resend', {
        email,
        callbackUrl: params.get('callbackUrl') || '/dashboard',
        redirect: false,
      })
      setStep('sent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(201,168,76,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: step === 'type' ? 680 : 480 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 52, justifyContent: 'center' }}>
          <span style={{ color: '#C9A84C', fontSize: 20 }}>✦</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', alignSelf: 'flex-end', marginBottom: 2 }}>PRIVATE</span>
        </Link>

        {/* STEP: Scegli tipo account */}
        {step === 'type' && (
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 300, textAlign: 'center', marginBottom: 8, letterSpacing: 1 }}>Benvenuto a Bordo</h2>
            <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.45)', textAlign: 'center', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 48, lineHeight: 1.7 }}>
              Come desidera utilizzare Aerojet Private?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 32 }}>
              {[
                { key: 'client', icon: '✈', title: 'Viaggiatore', desc: 'Voglio prenotare voli privati per me o la mia azienda. Accedo a preventivi personalizzati e prezzi live.', perks: ['Ricerca voli istantanea', 'Prezzi live Avinode', 'Concierge dedicato', 'Storico voli personale'] },
                { key: 'broker', icon: '◆', title: 'Broker / Agente', desc: 'Voglio gestire prenotazioni per i miei clienti e guadagnare commissioni su ogni volo.', perks: ['Dashboard commissions', 'Quote builder pro', 'CRM richieste', 'Accesso operatori diretti'] },
              ].map(({ key, icon, title, desc, perks }) => (
                <div key={key} onClick={() => setType(key as 'client' | 'broker')}
                  style={{ background: type === key ? '#141728' : '#0A0C14', padding: 32, cursor: 'pointer', borderLeft: type === key ? '3px solid #C9A84C' : '3px solid transparent', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 28, color: '#C9A84C', marginBottom: 16 }}>{icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{title}</div>
                  <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7, marginBottom: 20 }}>{desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {perks.map(p => (
                      <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                        <span style={{ color: '#C9A84C' }}>✦</span>{p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('form')} className="btn-gold" style={{ width: '100%', padding: '16px', fontSize: 13, letterSpacing: 2 }}>
              CONTINUA COME {type === 'client' ? 'VIAGGIATORE' : 'BROKER'} →
            </button>
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>
              Hai già un account?{' '}
              <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'none' }}>Accedi</Link>
            </p>
          </div>
        )}

        {/* STEP: Form dati */}
        {step === 'form' && (
          <div style={{ background: 'rgba(10,12,20,0.92)', border: '1px solid rgba(201,168,76,0.2)', backdropFilter: 'blur(20px)', padding: '48px 40px' }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>
              {type === 'client' ? 'ACCOUNT VIAGGIATORE' : 'ACCOUNT BROKER'}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 300, marginBottom: 36, letterSpacing: 1 }}>Crea il Suo Account</h2>

            {[
              { label: 'NOME COMPLETO *', key: 'name', value: name, set: setName, placeholder: 'Mario Rossi', type: 'text' },
              { label: 'EMAIL *', key: 'email', value: email, set: setEmail, placeholder: 'mario@email.it', type: 'email' },
              ...(type === 'broker' ? [{ label: 'AZIENDA / STUDIO', key: 'company', value: company, set: setCompany, placeholder: 'Travel Agency Srl', type: 'text' }] : []),
            ].map(({ label, key, value, set, placeholder, type: iType }) => (
              <div key={key} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>{label}</div>
                <input className="luxury-input" type={iType} placeholder={placeholder} value={value}
                  onChange={e => set(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              </div>
            ))}

            <button onClick={handleRegister} disabled={loading || !email || !name}
              className="btn-gold" style={{ width: '100%', padding: '15px', marginTop: 12, opacity: loading || !email || !name ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'INVIO LINK...' : 'CREA ACCOUNT E ACCEDI'}
            </button>

            {/* Google OAuth — only shown when GOOGLE_CLIENT_ID is configured server-side */}
            {googleEnabled && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.1)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif' }}>oppure</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.1)' }} />
                </div>

                <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  style={{ width: '100%', padding: '13px', background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#F0EDE6', fontSize: 13, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continua con Google
                </button>
              </>
            )}

            <button onClick={() => setStep('type')} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.3)', cursor: 'pointer', fontSize: 12, width: '100%', marginTop: 20, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
              ← TORNA INDIETRO
            </button>
          </div>
        )}

        {/* STEP: Email inviata */}
        {step === 'sent' && (
          <div style={{ background: 'rgba(10,12,20,0.92)', border: '1px solid rgba(201,168,76,0.2)', backdropFilter: 'blur(20px)', padding: '52px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, color: '#C9A84C', marginBottom: 28 }}>✉</div>
            <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 16 }}>Controlli la sua Email</h2>
            <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 32 }}>
              Abbiamo inviato un link di accesso a<br />
              <strong style={{ color: '#C9A84C' }}>{email}</strong><br />
              Il link è valido per 15 minuti.
            </p>
            <Link href="/login" style={{ fontSize: 12, letterSpacing: 2, color: '#C9A84C', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid rgba(201,168,76,0.3)', padding: '12px 28px', display: 'inline-block' }}>
              ← TORNA AL LOGIN
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  return <Suspense><RegisterFormInner googleEnabled={googleEnabled} /></Suspense>
}
